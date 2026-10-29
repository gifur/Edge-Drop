import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const itemCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'item.css'), 'utf8')
const headerTsx = readFileSync(join(__dirname, '..', 'src', 'components', 'Header.tsx'), 'utf8')
const indicatorTsx = readFileSync(join(__dirname, '..', 'src', 'components', 'CopyIndicatorCurve.tsx'), 'utf8')
const tokensCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'tokens.css'), 'utf8')
const settingsCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'settings.css'), 'utf8')
const segmentedCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'SegmentedControl.css'), 'utf8')

describe('light theme item contrast', () => {
  it('uses the warm light surface for both the panel and cards', () => {
    const lightBlock = tokensCss.match(/:root\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

    expect(lightBlock).toContain('--bg-1-base: #fef7ff')
    expect(lightBlock).toContain('--bg-2-base: #fef7ff')
  })

  it('uses a dedicated warm hover surface for light clipboard cards', () => {
    const lightBlock = tokensCss.match(/:root\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

    expect(lightBlock).toContain('--item-hover-bg: color-mix(in srgb, #f6f1f6 var(--panel-opacity), transparent)')
    expect(itemCss).toContain('background: var(--item-hover-bg)')
  })

  it('overrides preview text and footer surface for light cards', () => {
    expect(itemCss).toContain(":root[data-theme='light'] .item .preview")
    expect(itemCss).toContain(":root[data-theme='light'] .item-footer")
    expect(itemCss).toContain('color: var(--text-primary)')
    expect(itemCss).toContain('background: linear-gradient(180deg, transparent 0%, rgba(32, 38, 49, 0.1) 100%)')
  })

  it('uses theme-aware controls for the filter bar, edge indicator, and action pill', () => {
    expect(segmentedCss).toContain('background: var(--segment-track, var(--bg-card))')
    expect(segmentedCss).toContain('color: var(--segment-ink)')
    expect(indicatorTsx).toContain('fill="var(--indicator-fill)"')
    expect(itemCss).toContain(":root[data-theme='light'] .actions")
    expect(tokensCss).toContain('--segment-track: #e7ebf1')
    expect(tokensCss).toContain('--indicator-fill: #000000')
  })

  it('keeps light-theme settings icons visible and uses black active accents', () => {
    expect(headerTsx).toContain("color: 'var(--text-secondary)'")
    expect(tokensCss).toContain('--accent: #000000')
    expect(tokensCss).toContain('--toggle-on: #000000')
    expect(settingsCss).toContain('background: var(--accent)')
    expect(settingsCss).toContain('box-shadow: 0 2px 10px var(--accent-glow)')
  })
})
