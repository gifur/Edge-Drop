import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const settingsCss = readFileSync(join(__dirname, '..', 'src', 'styles', 'settings.css'), 'utf8')

describe('light theme hotkey contrast', () => {
  it('gives the shortcut field and keycaps readable light-theme surfaces', () => {
    expect(settingsCss).toContain(":root[data-theme='light'] .hotkey-field")
    expect(settingsCss).toContain(":root[data-theme='light'] .hotkey-keycap")
    expect(settingsCss).toContain(":root[data-theme='light'] .hotkey-keycap {")
    expect(settingsCss).toContain('background: var(--bg-3)')
    expect(settingsCss).toContain('color: var(--text-primary)')
  })

  it('keeps the edit action and keycap separators visible in light mode', () => {
    expect(settingsCss).toContain(":root[data-theme='light'] .hotkey-field-edit-badge")
    expect(settingsCss).toContain(":root[data-theme='light'] .hotkey-plus-symbol")
    expect(settingsCss).toContain(":root[data-theme='light'] .hotkey-inline-reset-btn")
    expect(settingsCss).toContain('border-color: var(--edge-light)')
  })
})
