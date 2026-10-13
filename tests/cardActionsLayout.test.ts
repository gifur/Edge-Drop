import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const panelCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'panel.css'), 'utf8')
const itemCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'item.css'), 'utf8')

function declaration(css: string, selector: string, property: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = css.match(new RegExp(`(?:^|\\n)${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? ''
  return block.match(new RegExp(`(?:^|\\n)\\s*${property}:\\s*([^;]+);`))?.[1].trim() ?? ''
}

function pixels(value: string): number {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/)
  if (!match) throw new Error(`Expected a pixel value, received "${value}"`)
  return Number(match[1])
}

function verticalPadding(value: string): { top: number; bottom: number } {
  const parts = value.split(/\s+/)
  if (parts.length < 1 || parts.length > 4) throw new Error(`Invalid padding shorthand: "${value}"`)
  const top = pixels(parts[0])
  const bottom = pixels(parts.length < 3 ? parts[0] : parts[2])
  return { top, bottom }
}

describe('vertical card action menu layout', () => {
  it('reserves the full floating menu height plus an 8px top safety gap', () => {
    const listPadding = verticalPadding(declaration(panelCss, '.list', 'padding'))
    const actionPadding = verticalPadding(declaration(itemCss, '.actions', 'padding'))
    const actionButtonHeight = pixels(declaration(itemCss, '.act', 'height'))
    const actionMenuHeight = actionButtonHeight + actionPadding.top + actionPadding.bottom

    expect(listPadding.top).toBeGreaterThanOrEqual(actionMenuHeight + 8)
  })
})
