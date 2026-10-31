import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { ClipboardItem, ItemData } from '../../shared/types'
import { isLinkText } from '../../shared/linkText'

const MAX_BODY_BYTES = 2 * 1024 * 1024
const MAX_TEXT_CHARS = 500_000

export interface PasteApiDeps {
  addText: (content: string) => boolean | void | Promise<boolean | void>
  listText: () => Array<{ content: string; type: 'text' }> | Promise<Array<{ content: string; type: 'text' }>>
}

const COLOR_HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function createTextItemData(content: string): Extract<ItemData, { kind: 'text' }> {
  const trimmed = content.trim()
  return {
    kind: 'text',
    text: content,
    isUrl: isLinkText(trimmed),
    isColor: COLOR_HEX_RE.test(trimmed)
  }
}

export function listTextItems(
  items: readonly ClipboardItem[],
  getFullText: (id: string) => string
): Array<{ content: string; type: 'text' }> {
  return items.flatMap((item) => {
    if (item.data.kind !== 'text') return []
    return [{
      content: item.data.hasFullPayload ? getFullText(item.id) : item.data.text,
      type: 'text' as const
    }]
  })
}

type ErrorPayload = { error: string; message: string }

class RequestError extends Error {
  constructor(readonly status: number, readonly payload: ErrorPayload) {
    super(payload.message)
  }
}

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(json))
  res.end(json)
}

function fail(status: number, error: string, message: string): never {
  throw new RequestError(status, { error, message })
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  let size = 0
  let settled = false
  const chunks: Buffer[] = []

  const raw = await new Promise<string>((resolve, reject) => {
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      fn()
    }

    req.on('data', (chunk: Buffer | string) => {
      if (settled) return
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > MAX_BODY_BYTES) {
        req.resume()
        finish(() => reject(new RequestError(413, {
          error: 'payload_too_large',
          message: 'Request body is too large'
        })))
        return
      }
      chunks.push(buffer)
    })
    req.on('end', () => finish(() => resolve(Buffer.concat(chunks).toString('utf8'))))
    req.on('error', (err) => finish(() => reject(err)))
  })

  try {
    return JSON.parse(raw)
  } catch {
    fail(400, 'invalid_json', 'Request body must be valid JSON')
  }
}

export class PasteApiServer {
  private server: Server | null = null
  private boundPort: number | null = null

  constructor(private readonly deps: PasteApiDeps) {}

  async start(port: number): Promise<void> {
    if (this.server) return

    const server = createServer((req, res) => {
      void this.handle(req, res)
    })
    this.server = server

    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => {
        server.off('listening', onListening)
        this.server = null
        this.boundPort = null
        reject(err)
      }
      const onListening = () => {
        server.off('error', onError)
        const address = server.address()
        if (!address || typeof address === 'string') {
          this.server = null
          this.boundPort = null
          reject(new Error('Paste API did not receive a TCP address'))
          return
        }
        this.boundPort = (address as AddressInfo).port
        resolve()
      }
      server.once('error', onError)
      server.once('listening', onListening)
      server.listen(port, '127.0.0.1')
    })
  }

  async stop(): Promise<void> {
    const server = this.server
    this.server = null
    this.boundPort = null
    if (!server) return

    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  }

  async reconfigure(enabled: boolean, port: number): Promise<void> {
    await this.stop()
    if (enabled) await this.start(port)
  }

  isRunning(): boolean {
    return this.server !== null && this.boundPort !== null
  }

  getPort(): number {
    if (this.boundPort === null) throw new Error('Paste API is not running')
    return this.boundPort
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', 'http://127.0.0.1')

    try {
      if (url.pathname === '/paste') {
        if (req.method !== 'POST') {
          writeJson(res, 405, { error: 'method_not_allowed', message: 'Use POST /paste' })
          return
        }
        await this.handlePaste(req, res)
        return
      }

      if (url.pathname === '/list') {
        if (req.method !== 'GET') {
          writeJson(res, 405, { error: 'method_not_allowed', message: 'Use GET /list' })
          return
        }
        const filter = url.searchParams.get('filter') ?? 'text'
        if (filter !== 'text') {
          fail(400, 'unsupported_filter', 'Only filter=text is supported')
        }
        writeJson(res, 200, await this.deps.listText())
        return
      }

      writeJson(res, 404, { error: 'not_found', message: 'Endpoint not found' })
    } catch (err) {
      if (err instanceof RequestError) {
        writeJson(res, err.status, err.payload)
        return
      }
      console.error('[PasteAPI] Request failed:', err)
      if (!res.headersSent) {
        writeJson(res, 500, { error: 'internal_error', message: 'Internal server error' })
      } else {
        res.destroy()
      }
    }
  }

  private async handlePaste(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await readJsonBody(req)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      fail(400, 'invalid_body', 'Request body must be a JSON object')
    }

    const record = body as Record<string, unknown>
    if (record.type !== 'text') {
      fail(400, 'unsupported_type', 'Only type=text is supported')
    }
    if (typeof record.content !== 'string' || record.content.length === 0) {
      fail(400, 'invalid_content', 'content must be a non-empty string')
    }
    if (record.content.length > MAX_TEXT_CHARS) {
      fail(413, 'content_too_large', 'Text content is limited to 500000 characters')
    }

    await this.deps.addText(record.content)
    writeJson(res, 200, { ok: true })
  }
}
