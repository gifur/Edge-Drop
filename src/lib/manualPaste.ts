export interface PasteShortcutEvent {
  key: string
  ctrlKey: boolean
  metaKey: boolean
}

export function isManualPasteShortcut(event: PasteShortcutEvent): boolean {
  return event.key.toLowerCase() === 'v' && event.ctrlKey !== event.metaKey
}
