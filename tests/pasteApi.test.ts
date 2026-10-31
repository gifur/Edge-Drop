import { describe, expect, it, vi, afterEach } from 'vitest'
import { request } from 'node:http'
import { createTextItemData, listTextItems, PasteApiServer } from '../electron/main/pasteApi'

type Response = { status: number; body: any }

function call(port: number, method: string, path: string, body?: unknown): Promise<Response> {
  return new Promise((resolve, reject) => {
    const req = request({
      host: '127.0.0.1',
      port,
      method,
      path,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' }
    }, (res) => {
      let raw = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { raw += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, body: JSON.parse(raw) })
        } catch (err) {
          reject(err)
        }
      })
    })
    req.on('error', reject)
    if (body !== undefined) req.write(JSON.stringify(body))
    req.end()
  })
}

describe('local paste HTTP API', () => {
  const servers: PasteApiServer[] = []

  afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.stop()))
  })

  async function start(listText = () => [{ content: 'existing', type: 'text' as const }]) {
    const addText = vi.fn()
    const server = new PasteApiServer({ addText, listText })
    await server.start(0)
    servers.push(server)
    return { server, addText, port: server.getPort() }
  }

  it('POST /paste accepts text and calls addText', async () => {
    const { addText, port } = await start()
    const response = await call(port, 'POST', '/paste', { content: 'hello', type: 'text' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
    expect(addText).toHaveBeenCalledWith('hello')
  })

  it('rejects unsupported POST types with a JSON 400 response', async () => {
    const { addText, port } = await start()
    const response = await call(port, 'POST', '/paste', { content: 'hello', type: 'image' })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('unsupported_type')
    expect(addText).not.toHaveBeenCalled()
  })

  it('GET /list defaults to text and returns complete content', async () => {
    const content = 'x'.repeat(301)
    const { port } = await start(() => [{ content, type: 'text' }])
    const response = await call(port, 'GET', '/list')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([{ content, type: 'text' }])
  })

  it('accepts GET /list?filter=text', async () => {
    const { port } = await start()
    const response = await call(port, 'GET', '/list?filter=text')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([{ content: 'existing', type: 'text' }])
  })

  it('rejects unsupported filters, methods, and paths', async () => {
    const { port } = await start()

    await expect(call(port, 'GET', '/list?filter=image')).resolves.toMatchObject({
      status: 400,
      body: { error: 'unsupported_filter' }
    })
    await expect(call(port, 'GET', '/paste')).resolves.toMatchObject({ status: 405 })
    await expect(call(port, 'POST', '/unknown', {})).resolves.toMatchObject({ status: 404 })
  })

  it('builds text item data with the existing URL and color classification', () => {
    expect(createTextItemData('https://example.com')).toMatchObject({
      kind: 'text',
      text: 'https://example.com',
      isUrl: true,
      isColor: false
    })
    expect(createTextItemData('#12abef')).toMatchObject({
      kind: 'text',
      text: '#12abef',
      isUrl: false,
      isColor: true
    })
  })

  it('lists only text items and expands full payloads', () => {
    const full = 'z'.repeat(301)
    const items = [
      { id: 'image', data: { kind: 'image', imageId: 'image', width: 1, height: 1, bytes: 1 }, capturedAt: 1, hitCount: 1, pinned: false },
      { id: 'long', data: { kind: 'text', text: full.slice(0, 300), isUrl: false, hasFullPayload: true }, capturedAt: 2, hitCount: 1, pinned: false },
      { id: 'short', data: { kind: 'text', text: 'short', isUrl: false }, capturedAt: 3, hitCount: 1, pinned: false }
    ] as any

    expect(listTextItems(items, (id) => id === 'long' ? full : 'short')).toEqual([
      { content: full, type: 'text' },
      { content: 'short', type: 'text' }
    ])
  })
})
