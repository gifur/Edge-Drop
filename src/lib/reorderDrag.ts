import type { ReorderRequest } from '../../shared/types'

export interface ReorderDropTarget {
  id: string
  placement: ReorderRequest['placement']
}

export interface ReorderCardRect {
  id: string
  left: number
  top: number
  right: number
  bottom: number
}

export function findReorderPointerTarget(
  sourceId: string,
  clientX: number,
  clientY: number,
  horizontal: boolean,
  cards: readonly ReorderCardRect[],
  items: ReadonlyArray<{ id: string; pinned: boolean }>
): ReorderDropTarget | null {
  const sourceItem = items.find((item) => item.id === sourceId)
  if (!sourceItem) return null

  const sourceCard = cards.find((card) => card.id === sourceId)
  if (
    sourceCard &&
    clientX >= sourceCard.left && clientX <= sourceCard.right &&
    clientY >= sourceCard.top && clientY <= sourceCard.bottom
  ) return null

  const eligibleCards = cards.filter((card) => {
    if (card.id === sourceId) return false
    return items.find((item) => item.id === card.id)?.pinned === sourceItem.pinned
  })
  if (eligibleCards.length === 0) return null

  const target = eligibleCards.find((card) => (
    clientX >= card.left && clientX <= card.right &&
    clientY >= card.top && clientY <= card.bottom
  )) ?? eligibleCards.reduce((nearest, card) => {
    const point = horizontal ? clientX : clientY
    const start = horizontal ? card.left : card.top
    const end = horizontal ? card.right : card.bottom
    const distance = point < start ? start - point : point > end ? point - end : 0

    const nearestStart = horizontal ? nearest.left : nearest.top
    const nearestEnd = horizontal ? nearest.right : nearest.bottom
    const nearestDistance = point < nearestStart
      ? nearestStart - point
      : point > nearestEnd ? point - nearestEnd : 0
    return distance < nearestDistance ? card : nearest
  })

  const midpoint = horizontal
    ? target.left + (target.right - target.left) / 2
    : target.top + (target.bottom - target.top) / 2
  const placement: ReorderRequest['placement'] = (horizontal ? clientX : clientY) < midpoint
    ? 'before'
    : 'after'
  const request = resolveRememberedReorder(sourceId, { id: target.id, placement }, items)
  return request ? { id: request.targetId, placement: request.placement } : null
}

export function resolveRememberedReorder(
  sourceId: string | null,
  target: ReorderDropTarget | null,
  items: ReadonlyArray<{ id: string; pinned: boolean }>
): ReorderRequest | null {
  if (!sourceId || !target || sourceId === target.id) return null

  const sourceItem = items.find((item) => item.id === sourceId)
  const targetItem = items.find((item) => item.id === target.id)
  if (!sourceItem || !targetItem || sourceItem.pinned !== targetItem.pinned) return null

  const sectionItems = items.filter((item) => item.pinned === sourceItem.pinned)
  const sourceIndex = sectionItems.findIndex((item) => item.id === sourceId)
  const targetIndex = sectionItems.findIndex((item) => item.id === target.id)
  let placement = target.placement

  if (sourceIndex === targetIndex - 1 && placement === 'before') placement = 'after'
  if (sourceIndex === targetIndex + 1 && placement === 'after') placement = 'before'

  return { sourceId, targetId: target.id, placement }
}
