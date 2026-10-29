import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_SETTINGS } from '../shared/types'
import { normalizeSettings } from '../electron/store/settings'

const settingsSrc = readFileSync(join(__dirname, '..', 'src', 'components', 'Settings.tsx'), 'utf8')
const themeSrc = readFileSync(join(__dirname, '..', 'src', 'lib', 'theme.ts'), 'utf8')
const appSrc = readFileSync(join(__dirname, '..', 'src', 'App.tsx'), 'utf8')
const hoverSrc = readFileSync(join(__dirname, '..', 'src', 'hooks', 'useEdgeHover.ts'), 'utf8')
const tokensCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'tokens.css'), 'utf8')

describe('panel width setting', () => {
  it('defaults legacy settings to 270px and clamps persisted values', () => {
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelWidth: undefined }).panelWidth).toBe(270)
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelWidth: 100 }).panelWidth).toBe(220)
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelWidth: 500 }).panelWidth).toBe(360)
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, panelWidth: 315 }).panelWidth).toBe(315)
  })

  it('exposes a left/right appearance slider and applies it to the panel token', () => {
    expect(settingsSrc).toContain("t('appearance.panelWidthTitle')")
    expect(settingsSrc).toContain('value={settings.panelWidth ?? 270}')
    expect(settingsSrc).toContain('min={220}')
    expect(settingsSrc).toContain('max={360}')
    expect(settingsSrc).toContain('patch({ panelWidth: clamped })')
    expect(appSrc).toContain('applyAppearance(settings.panelOpacity, settings.panelWidth)')
    expect(themeSrc).toContain("setProperty('--panel-width'")
    expect(tokensCss).toContain('--panel-width: 270px')

    const horizontalAppearance = settingsSrc.slice(
      settingsSrc.indexOf("horizontalTab === 'appearance'"),
      settingsSrc.indexOf("horizontalTab === 'appearance'") + 5000
    )
    expect(horizontalAppearance).not.toContain('panelWidthTitle')
  })

  it('uses the configured width for side-dock close hysteresis', () => {
    expect(hoverSrc).toContain('state.settings.panelWidth ?? PANEL_WIDE')
    expect(hoverSrc).toContain('state.settings.panelWidth !== prevState.settings.panelWidth')
    expect(hoverSrc).not.toContain('const currentPanelWide = hasFlyout ? PREVIEW_WIDE : PANEL_WIDE')
  })
})
