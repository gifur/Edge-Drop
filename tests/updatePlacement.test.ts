import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8')
}

describe('update prompt placement contracts', () => {
  it('keeps update renderers available while the product surface is disabled', () => {
    const src = read('src/components/Settings.tsx')
    expect(src).toContain('const SHOW_UPDATE_SETTINGS = false')
    expect(src).toContain('if (!SHOW_UPDATE_SETTINGS) return null')
    expect(src).toContain('if (isStoreBuild || hasPromotedTopUpdate) return null')
    expect(src).toContain('{SHOW_UPDATE_SETTINGS && !isStoreBuild && !hasPromotedTopUpdate && (')
  })

  it('store tracks manual-flow ownership across check, download, and dismiss', () => {
    const src = read('src/store/appStore.ts')
    expect(src).toContain('manualUpdateActive: boolean')
    expect(src).toContain('manualUpdateActive: true')
    // Dismiss and stale-result paths release ownership.
    expect(src).toContain('manualUpdateActive: false')
  })

  it('a background find for a newer version retires stale manual results', () => {
    const src = read('src/store/appStore.ts')
    expect(src).toContain("mc.version !== info.version")
  })
})
