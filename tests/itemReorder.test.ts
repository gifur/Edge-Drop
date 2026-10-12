import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const fsRoots = vi.hoisted(() => ({
  home: '',
  userData: ''
}))

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getAppPath: () => join(fsRoots.userData, 'app'),
    getPath: (name: string) => (name === 'userData' ? fsRoots.userData : join(fsRoots.userData, name))
  },
  nativeImage: { createFromPath: () => ({ isEmpty: () => true }) },
  safeStorage: { isEncryptionAvailable: () => false }
}))

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>()
  return { ...actual, homedir: () => fsRoots.home }
})

import { ItemStore } from '../electron/store/ItemStore'
import { findReorderPointerTarget, resolveRememberedReorder } from '../src/lib/reorderDrag'

const stores: ItemStore[] = []

function makeStore(): ItemStore {
  const store = new ItemStore()
  stores.push(store)
  return store
}

function addText(store: ItemStore, text: string): string {
  store.add({ kind: 'text', text, isUrl: false }, 20)
  return store.list()[0].id
}

function texts(store: ItemStore, pinned: boolean): string[] {
  return store.list()
    .filter((item) => item.pinned === pinned)
    .map((item) => item.data.kind === 'text' ? item.data.text : '')
}

describe('ItemStore reorder', () => {
  beforeEach(() => {
    stores.length = 0
    fsRoots.userData = join(tmpdir(), `ed-reorder-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    fsRoots.home = join(tmpdir(), `ed-reorder-home-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    mkdirSync(fsRoots.userData, { recursive: true })
    mkdirSync(fsRoots.home, { recursive: true })
  })

  afterEach(() => {
    stores.forEach((store) => store.persistSync())
    try { rmSync(fsRoots.userData, { recursive: true, force: true }) } catch { /* ignore */ }
    try { rmSync(fsRoots.home, { recursive: true, force: true }) } catch { /* ignore */ }
  })

  it('moves a recent item before another recent item', () => {
    const store = makeStore()
    addText(store, 'oldest')
    const middleId = addText(store, 'middle')
    const newestId = addText(store, 'newest')

    expect(store.reorder({ sourceId: middleId, targetId: newestId, placement: 'before' })).toBe(true)
    expect(texts(store, false)).toEqual(['middle', 'newest', 'oldest'])
  })

  it('moves a pinned item after another pinned item', () => {
    const store = makeStore()
    const firstId = addText(store, 'first')
    const secondId = addText(store, 'second')
    store.setPinned(firstId, true)
    store.setPinned(secondId, true)

    expect(store.reorder({ sourceId: secondId, targetId: firstId, placement: 'after' })).toBe(true)
    expect(texts(store, true)).toEqual(['first', 'second'])
  })

  it('rejects a move between pinned and recent sections', () => {
    const store = makeStore()
    const recentId = addText(store, 'recent')
    const pinnedId = addText(store, 'pinned')
    store.setPinned(pinnedId, true)
    const before = store.list().map((item) => item.id)

    expect(store.reorder({ sourceId: recentId, targetId: pinnedId, placement: 'before' })).toBe(false)
    expect(store.list().map((item) => item.id)).toEqual(before)
  })

  it('preserves the reordered sequence after persistence and reload', () => {
    const store = makeStore()
    const oldestId = addText(store, 'oldest')
    addText(store, 'middle')
    const newestId = addText(store, 'newest')

    store.reorder({ sourceId: oldestId, targetId: newestId, placement: 'before' })
    store.persistSync()

    const reopened = makeStore()
    reopened.load()
    expect(texts(reopened, false)).toEqual(['oldest', 'newest', 'middle'])
  })
})

describe('remembered reorder target', () => {
  const items = [
    { id: 'pinned-1', pinned: true },
    { id: 'pinned-2', pinned: true },
    { id: 'recent-1', pinned: false },
    { id: 'recent-2', pinned: false }
  ]

  it('resolves the last valid card target when the list receives the drop', () => {
    expect(resolveRememberedReorder(
      'recent-2',
      { id: 'recent-1', placement: 'before' },
      items
    )).toEqual({ sourceId: 'recent-2', targetId: 'recent-1', placement: 'before' })
  })

  it('rejects a remembered target from the other pin section', () => {
    expect(resolveRememberedReorder(
      'recent-1',
      { id: 'pinned-1', placement: 'after' },
      items
    )).toBeNull()
  })

  it('turns an adjacent no-op placement into a real downward move', () => {
    expect(resolveRememberedReorder(
      'recent-1',
      { id: 'recent-2', placement: 'before' },
      items
    )).toEqual({ sourceId: 'recent-1', targetId: 'recent-2', placement: 'after' })
  })

  it('turns an adjacent no-op placement into a real upward move', () => {
    expect(resolveRememberedReorder(
      'recent-2',
      { id: 'recent-1', placement: 'after' },
      items
    )).toEqual({ sourceId: 'recent-2', targetId: 'recent-1', placement: 'before' })
  })

  it('finds the card above the source during a pointer reorder', () => {
    const pointerItems = [
      { id: 'top', pinned: false },
      { id: 'middle', pinned: false },
      { id: 'bottom', pinned: false }
    ]
    const cards = [
      { id: 'top', left: 0, top: 0, right: 100, bottom: 80 },
      { id: 'middle', left: 0, top: 90, right: 100, bottom: 170 },
      { id: 'bottom', left: 0, top: 180, right: 100, bottom: 260 }
    ]

    expect(findReorderPointerTarget('middle', 50, 20, false, cards, pointerItems))
      .toEqual({ id: 'top', placement: 'before' })
  })

  it('turns a pointer move onto the next card into a downward swap', () => {
    const pointerItems = [
      { id: 'top', pinned: false },
      { id: 'middle', pinned: false },
      { id: 'bottom', pinned: false }
    ]
    const cards = [
      { id: 'top', left: 0, top: 0, right: 100, bottom: 80 },
      { id: 'middle', left: 0, top: 90, right: 100, bottom: 170 },
      { id: 'bottom', left: 0, top: 180, right: 100, bottom: 260 }
    ]

    expect(findReorderPointerTarget('middle', 50, 200, false, cards, pointerItems))
      .toEqual({ id: 'bottom', placement: 'after' })
  })

  it('does not create a pointer target while still over the source card', () => {
    const pointerItems = [
      { id: 'top', pinned: false },
      { id: 'middle', pinned: false }
    ]
    const cards = [
      { id: 'top', left: 0, top: 0, right: 100, bottom: 80 },
      { id: 'middle', left: 0, top: 90, right: 100, bottom: 170 }
    ]

    expect(findReorderPointerTarget('middle', 50, 120, false, cards, pointerItems)).toBeNull()
  })
})
