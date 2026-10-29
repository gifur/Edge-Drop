import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_SETTINGS } from '../shared/types'
import { normalizeSettings } from '../electron/store/settings'

const settingsSrc = readFileSync(join(__dirname, '..', 'src', 'components', 'Settings.tsx'), 'utf8')
const themeSrc = readFileSync(join(__dirname, '..', 'src', 'lib', 'theme.ts'), 'utf8')
const appSrc = readFileSync(join(__dirname, '..', 'src', 'App.tsx'), 'utf8')

describe('appearance settings normalization', () => {
  it('defaults missing opacity to fully opaque', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, panelOpacity: undefined })

    expect(settings.panelOpacity).toBe(100)
  })

  it('clamps panel opacity to 0-100', () => {
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelOpacity: -10 }).panelOpacity).toBe(0)
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelOpacity: 125 }).panelOpacity).toBe(100)
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelOpacity: 42 }).panelOpacity).toBe(42)
  })

  it('falls back safely for an invalid persisted opacity', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, panelOpacity: Number.NaN })

    expect(settings.panelOpacity).toBe(100)
  })

  it('exposes an opacity slider and applies only dark-mode appearance values', () => {
    expect(settingsSrc).toContain("t('appearance.panelOpacityTitle')")
    expect(settingsSrc).toContain('value={settings.panelOpacity ?? 100}')
    expect(settingsSrc).toContain('patch({ panelOpacity: clamped })')
    expect(settingsSrc).not.toContain('ThemeModeSelector')
    expect(appSrc).toContain('applyAppearance(settings.panelOpacity, settings.panelWidth)')
    expect(themeSrc).not.toContain('dataset.theme')
  })
})
