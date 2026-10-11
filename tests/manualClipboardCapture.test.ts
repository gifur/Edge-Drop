import { describe, expect, it, vi } from 'vitest'
import type { ItemData } from '../shared/types'
import { captureClipboardItem } from '../electron/clipboard/manualCapture'

function makeDeps(data: ItemData | null) {
  return {
    readClipboard: vi.fn(async () => data),
    readImage: vi.fn(() => ({
      isEmpty: () => false,
      toPNG: () => Buffer.from('png-bytes')
    })),
    createId: vi.fn(() => 'manual-image-id'),
    historyLimit: 250,
    add: vi.fn(() => true),
    stageImageBytes: vi.fn(),
    prefetchFileIcons: vi.fn(),
    pushItems: vi.fn()
  }
}

describe('manual clipboard capture', () => {
  it('adds text explicitly even when the background watcher is paused', async () => {
    const data: ItemData = { kind: 'text', text: 'private note', isUrl: false }
    const deps = makeDeps(data)

    const captured = await captureClipboardItem(deps)

    expect(captured).toBe(true)
    expect(deps.add).toHaveBeenCalledWith(data, 250)
    expect(deps.pushItems).toHaveBeenCalledWith({ reason: 'usage' })
  })

  it('imports copied files through the same file metadata path as drag-in', async () => {
    const data: ItemData = { kind: 'files', paths: ['C:\\docs\\report.pdf'] }
    const deps = makeDeps(data)

    await captureClipboardItem(deps)

    expect(deps.prefetchFileIcons).toHaveBeenCalledWith(data.paths)
    expect(deps.add).toHaveBeenCalledWith(data, 250)
  })

  it('stages a copied image and assigns its persisted image identity', async () => {
    const data: ItemData = {
      kind: 'image',
      imageId: '',
      width: 1920,
      height: 1080,
      bytes: 0,
      ext: 'png',
      source: 'image'
    }
    const deps = makeDeps(data)

    await captureClipboardItem(deps)

    expect(deps.stageImageBytes).toHaveBeenCalledWith('manual-image-id', Buffer.from('png-bytes'))
    expect(deps.add).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'image',
        imageId: 'manual-image-id',
        bytes: 9,
        ext: 'png'
      }),
      250
    )
  })

  it('does nothing when the clipboard has no supported content', async () => {
    const deps = makeDeps(null)

    const captured = await captureClipboardItem(deps)

    expect(captured).toBe(false)
    expect(deps.add).not.toHaveBeenCalled()
    expect(deps.pushItems).not.toHaveBeenCalled()
  })
})
