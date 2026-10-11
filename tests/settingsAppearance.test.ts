import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, type Settings } from '../shared/types'
import { normalizeSettings } from '../electron/store/settings'

describe('appearance settings normalization', () => {
  it('defaults missing appearance settings to dark and fully opaque', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, themeMode: undefined, panelOpacity: undefined })

    expect(settings.themeMode).toBe('dark')
    expect(settings.panelOpacity).toBe(100)
  })

  it('preserves valid light mode and clamps panel opacity to 0-100', () => {
    const base = { ...DEFAULT_SETTINGS, themeMode: 'light' as const }

    expect(normalizeSettings({ ...base, panelOpacity: -10 }).panelOpacity).toBe(0)
    expect(normalizeSettings({ ...base, panelOpacity: 125 }).panelOpacity).toBe(100)
    expect(normalizeSettings({ ...base, panelOpacity: 42 }).panelOpacity).toBe(42)
    expect(normalizeSettings({ ...base, panelOpacity: 42 }).themeMode).toBe('light')
  })

  it('falls back safely for invalid persisted appearance values', () => {
    const settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      themeMode: 'sepia' as Settings['themeMode'],
      panelOpacity: Number.NaN
    })

    expect(settings.themeMode).toBe('dark')
    expect(settings.panelOpacity).toBe(100)
  })
})
