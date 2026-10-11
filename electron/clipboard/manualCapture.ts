import type { ItemData } from '../../shared/types'

export interface ManualCaptureImage {
  isEmpty(): boolean
  toPNG(): Buffer
}

export interface ManualCaptureDeps {
  readClipboard: () => Promise<ItemData | null>
  readImage: () => ManualCaptureImage
  createId: () => string
  historyLimit: number
  add: (data: ItemData, limit: number) => boolean
  stageImageBytes: (imageId: string, png: Buffer) => void
  prefetchFileIcons: (paths: string[]) => void
  pushItems: (meta: { reason: 'usage' }) => void
}

/**
 * Explicitly import the current system clipboard once.
 *
 * This is intentionally separate from ClipboardWatcher: an incognito session
 * can stay paused while a deliberate Ctrl+V still records exactly one item.
 */
export async function captureClipboardItem(deps: ManualCaptureDeps): Promise<boolean> {
  const data = await deps.readClipboard()
  if (!data) return false

  let captured = data
  if (data.kind === 'image') {
    const image = deps.readImage()
    if (image.isEmpty()) return false
    const png = image.toPNG()
    const imageId = deps.createId()
    captured = {
      ...data,
      imageId,
      bytes: png.length,
      ext: 'png'
    }
    deps.stageImageBytes(imageId, png)
  } else if (data.kind === 'files') {
    deps.prefetchFileIcons(data.paths)
  }

  const changed = deps.add(captured, deps.historyLimit)
  if (changed) deps.pushItems({ reason: 'usage' })
  return changed
}
