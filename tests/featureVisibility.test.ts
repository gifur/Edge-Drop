import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEFAULT_SETTINGS } from '../shared/types'

function read(relPath: string): string {
  return readFileSync(resolve(__dirname, '..', relPath), 'utf8')
}

describe('temporarily hidden optional features', () => {
  it('keeps login startup disabled by default and updates disabled by default', () => {
    expect(DEFAULT_SETTINGS.launchAtLogin).toBe(false)
    expect(DEFAULT_SETTINGS.autoUpdates).toBe(false)
    expect(DEFAULT_SETTINGS.updateMode).toBe('off')
  })

  it('hides login startup, update controls, and community/support content from Settings', () => {
    const src = read('src/components/Settings.tsx')

    expect(src).toContain('const SHOW_LOGIN_AT_STARTUP_SETTING = false')
    expect(src).toContain('const SHOW_UPDATE_SETTINGS = false')
    expect(src).toContain('const SHOW_COMMUNITY_SUPPORT = false')
    expect(src).toContain('if (!SHOW_COMMUNITY_SUPPORT) return null')
  })

  it('does not schedule a proactive update check during updater initialization', () => {
    const src = read('electron/main/updater.ts')
    const initBlock = src.slice(src.indexOf('export function initAutoUpdater'))

    expect(initBlock).toContain('const shouldCheck = false')
    expect(initBlock).toContain('autoUpdater.autoDownload = false')
    expect(initBlock).toContain('autoUpdater.autoInstallOnAppQuit = false')
  })
})
