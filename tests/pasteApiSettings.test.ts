import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_SETTINGS, PASTE_API_DEFAULT_PORT } from '../shared/types'
import { normalizeSettings } from '../electron/store/settings'

describe('local paste API settings', () => {
  it('defaults the API to disabled on the dedicated port', () => {
    expect(DEFAULT_SETTINGS.pasteApiEnabled).toBe(false)
    expect(DEFAULT_SETTINGS.pasteApiPort).toBe(PASTE_API_DEFAULT_PORT)
    expect(PASTE_API_DEFAULT_PORT).toBe(18765)
  })

  it('repairs invalid paste API ports', () => {
    expect(normalizeSettings({ pasteApiPort: 80 }).pasteApiPort).toBe(PASTE_API_DEFAULT_PORT)
    expect(normalizeSettings({ pasteApiPort: 70000 }).pasteApiPort).toBe(PASTE_API_DEFAULT_PORT)
    expect(normalizeSettings({ pasteApiPort: 'bad' as any }).pasteApiPort).toBe(PASTE_API_DEFAULT_PORT)
    expect(normalizeSettings({ pasteApiPort: 23456 }).pasteApiPort).toBe(23456)
  })

  it('wires the API into state and app lifecycle', () => {
    const read = (file: string) => readFileSync(join(__dirname, '..', file), 'utf8')
    const state = read('electron/main/state.ts')
    const main = read('electron/main/index.ts')
    const ipc = read('electron/main/ipc.ts')

    expect(state).toContain('export function addTextToHistory')
    expect(state).toContain('export function listTextHistory')
    expect(main).toContain('pasteApi.reconfigure(settings.pasteApiEnabled, settings.pasteApiPort)')
    expect(main).toContain('pasteApi.stop()')
    expect(ipc).toContain('pasteApi.reconfigure(next.pasteApiEnabled, next.pasteApiPort)')
  })
})
