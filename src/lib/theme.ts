/** Appearance: writes user panel preferences to :root. */

/** Apply reduce-motion preference as a data attribute the CSS can key off. */
export function applyReduceMotion(reduce: boolean): void {
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'
}

export function applyAppearance(panelOpacity: number | undefined, panelWidth: number | undefined): void {
  const opacity = Number.isFinite(panelOpacity) ? Math.min(100, Math.max(0, Math.round(panelOpacity as number))) : 100
  const width = Number.isFinite(panelWidth) ? Math.min(360, Math.max(220, Math.round(panelWidth as number))) : 270
  document.documentElement.style.setProperty('--panel-opacity', `${opacity}%`)
  document.documentElement.style.setProperty('--panel-width', `${width}px`)
}
