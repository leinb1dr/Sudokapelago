/** Hold duration before a press on a grid cell becomes a pan. */
export const LONG_PRESS_MS = 350

/** Pointer movement (px) that cancels a pending long-press before it activates. */
export const LONG_PRESS_MOVE_TOLERANCE_PX = 10

/**
 * Pan starts immediately on empty viewport chrome, or when Shift is held on a
 * cell. Otherwise a long-press is required so short taps can still select.
 */
export function shouldStartImmediatePan(
  onCell: boolean,
  shiftKey: boolean,
): boolean {
  return !onCell || shiftKey
}

export function exceedsMoveTolerance(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  tolerancePx: number = LONG_PRESS_MOVE_TOLERANCE_PX,
): boolean {
  const deltaX = currentX - startX
  const deltaY = currentY - startY
  return deltaX * deltaX + deltaY * deltaY > tolerancePx * tolerancePx
}
