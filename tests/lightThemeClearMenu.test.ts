import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const panelCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'panel.css'), 'utf8')
const clearMenuTsx = readFileSync(join(__dirname, '..', 'src', 'components', 'ClearMenu.tsx'), 'utf8')

describe('light theme clear menu contrast', () => {
  it('uses light-theme surfaces and readable text for the clear button', () => {
    expect(panelCss).toContain(":root[data-theme='light'] .text-btn")
    expect(panelCss).toContain(":root[data-theme='light'] .text-btn:hover:not(:disabled)")
    expect(panelCss).toContain('background: var(--bg-3)')
    expect(panelCss).toContain('color: var(--text-secondary)')
  })

  it('uses theme tokens for the clear menu instead of dark-only colors', () => {
    expect(clearMenuTsx).toContain('className="clear-menu-popover"')
    expect(clearMenuTsx).toContain('className="clear-menu-item"')
    expect(clearMenuTsx).toContain('className="clear-menu-divider"')
    expect(panelCss).toContain('.clear-menu-popover')
    expect(panelCss).toContain('background: var(--bg-card)')
    expect(panelCss).toContain('color: var(--text-secondary)')
  })
})
