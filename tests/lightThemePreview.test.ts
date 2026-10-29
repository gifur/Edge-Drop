import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function read(relPath: string): string {
  return readFileSync(resolve(__dirname, '..', relPath), 'utf8')
}

describe('light theme preview and pinned surfaces', () => {
  it('PreviewFlyout uses theme tokens for its surface and controls', () => {
    const src = read('src/components/PreviewFlyout.tsx')
    const css = read('src/styles/previewFlyout.css')

    expect(src).toContain("background: dragOver ? 'rgba(15, 30, 18, 0.95)' : 'var(--bg-card)'")
    expect(css).toContain('box-shadow: inset 0 0 0 1px var(--edge-light)')
    expect(css).toContain('color: var(--text-primary)')
    expect(src).not.toContain("background: dragOver ? 'rgba(15, 30, 18, 0.95)' : '#141414'")
  })

  it('PreviewFlyout action buttons and selection badges use theme-aware colors', () => {
    const itemCss = read('src/styles/item.css')

    expect(itemCss).toContain('background: var(--selection-bg)')
    expect(itemCss).toContain('var(--selection-border)')
    expect(itemCss).toContain('var(--selection-shadow)')
  })

  it('pinned header and pinned item text use theme tokens', () => {
    const panel = read('src/styles/panel.css')
    const item = read('src/styles/item.css')

    expect(panel).toContain('.pinned-header-left')
    expect(panel).toContain('color: var(--text-secondary);')
    expect(panel).toContain('.pinned-header-interactive:hover')
    expect(panel).toContain('background: var(--bg-card-hover);')
    expect(item).toContain('.item.pinned')
    expect(item).toContain('background: var(--bg-card);')
    expect(item).toContain('color: var(--text-primary);')
    expect(item).toContain('color: var(--text-tertiary);')
  })
})
