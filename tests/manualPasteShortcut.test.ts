import { describe, expect, it } from 'vitest'
import { isManualPasteShortcut } from '../src/lib/manualPaste'

describe('manual paste shortcut', () => {
  it('recognizes Ctrl+V and Cmd+V', () => {
    expect(isManualPasteShortcut({ key: 'v', ctrlKey: true, metaKey: false })).toBe(true)
    expect(isManualPasteShortcut({ key: 'V', ctrlKey: false, metaKey: true })).toBe(true)
  })

  it('does not claim unrelated key combinations', () => {
    expect(isManualPasteShortcut({ key: 'c', ctrlKey: true, metaKey: false })).toBe(false)
    expect(isManualPasteShortcut({ key: 'v', ctrlKey: false, metaKey: false })).toBe(false)
    expect(isManualPasteShortcut({ key: 'v', ctrlKey: true, metaKey: true })).toBe(false)
  })
})
