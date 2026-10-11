import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const settingsCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'settings.css'), 'utf8')

describe('display selector layout', () => {
  it('keeps display name and resolution on one visible row', () => {
    const displayPill = settingsCss.slice(settingsCss.indexOf('.display-pill {'), settingsCss.indexOf('.setting-toggle {'))

    expect(displayPill).toContain('flex-direction: row')
    expect(displayPill).toContain('padding: 0 12px')
    expect(displayPill).toContain('text-overflow: ellipsis')
    expect(displayPill).toContain('white-space: nowrap')
  })
})
