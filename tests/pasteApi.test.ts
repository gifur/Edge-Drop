import { describe, expect, it, vi, afterEach } from 'vitest'
import { request } from 'node:http'
import { PasteApiServer } from '../electron/main/pasteApi'

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
})
