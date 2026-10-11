/** Theme: writes user appearance preferences to :root. */

import type { ThemeMode } from '../../shared/types'


/** Apply reduce-motion preference as a data attribute the CSS can key off. */
export function applyReduceMotion(reduce: boolean): void {
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'
}

export function applyAppearance(themeMode: ThemeMode | undefined, panelOpacity: number | undefined, panelWidth: number | undefined): void {
  const mode = themeMode === 'light' ? 'light' : 'dark'
  const opacity = Number.isFinite(panelOpacity) ? Math.min(100, Math.max(0, Math.round(panelOpacity as number))) : 100
  const width = Number.isFinite(panelWidth) ? Math.min(360, Math.max(220, Math.round(panelWidth as number))) : 270
  document.documentElement.dataset.theme = mode
  document.documentElement.style.setProperty('--panel-opacity', `${opacity}%`)
  document.documentElement.style.setProperty('--panel-width', `${width}px`)
}
