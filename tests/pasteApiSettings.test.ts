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

  it('renders the local API toggle and port input in Behaviour settings', () => {
    const settings = readFileSync(join(__dirname, '..', 'src/components/Settings.tsx'), 'utf8')
    expect(settings).toContain('settings.pasteApiEnabled')
    expect(settings).toContain('patch({ pasteApiEnabled: v })')
    expect(settings).toContain('settings.pasteApiPort')
    expect(settings).toContain('min={1024}')
    expect(settings).toContain('max={65535}')
    expect(settings).toContain('patch({ pasteApiPort:')
  })

  it('localizes every user-visible paste API setting in every language', () => {
    const translations = readFileSync(join(__dirname, '..', 'src/i18n/translations.ts'), 'utf8')
    const settings = readFileSync(join(__dirname, '..', 'src/components/Settings.tsx'), 'utf8')
    const ipc = readFileSync(join(__dirname, '..', 'electron/main/ipc.ts'), 'utf8')
    const dictionaries = translations.match(/export const \w+: TranslationKeys = \{/g)?.length ?? 0

    expect(dictionaries).toBe(31)
    for (const key of ['pasteApiTitle', 'pasteApiDescOff', 'pasteApiDescOn', 'pasteApiPortLabel', 'pasteApiStartFailed']) {
      expect(translations.split(`"${key}":`).length - 1, key).toBe(dictionaries)
    }
    expect(translations).toContain('"pasteApiTitle": "本地粘贴接口"')
    expect(translations).toContain('"pasteApiPortLabel": "端口"')
    expect(settings).toContain("t('behaviour.pasteApiTitle')")
    expect(settings).toContain("t('behaviour.pasteApiDescOn', { port: settings.pasteApiPort })")
    expect(settings).toContain("t('behaviour.pasteApiDescOff')")
    expect(settings).toContain("t('behaviour.pasteApiPortLabel')")
    expect(settings).not.toContain("title: 'Local paste API'")
    expect(ipc).toContain("toast('toast.pasteApiStartFailed', 'error')")
    expect(ipc).not.toContain("toast('Local paste API failed to start'")
  })
})
