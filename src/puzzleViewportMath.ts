import type { PuzzleViewportTransform } from './PuzzleViewport'

export interface ContentRect {
  left: number
  top: number
  width: number
  height: number
}

/** Visible area of the puzzle world in unscaled content coordinates. */
export function getVisibleContentRect(
  transform: PuzzleViewportTransform,
  contentWidth: number,
  contentHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): ContentRect {
  const visibleWidth = viewportWidth / transform.scale
  const visibleHeight = viewportHeight / transform.scale
  const contentCenterX = contentWidth / 2
  const contentCenterY = contentHeight / 2

  return {
    left:
      contentCenterX - transform.translateX / transform.scale - visibleWidth / 2,
    top:
      contentCenterY - transform.translateY / transform.scale - visibleHeight / 2,
    width: visibleWidth,
    height: visibleHeight,
  }
}

/** Cell rectangle in unscaled content coordinates (content top-left origin). */
export function cellContentRect(
  cellX: number,
  cellY: number,
  boundsMinX: number,
  boundsMinY: number,
  cellSizePx: number,
): ContentRect {
  return {
    left: (cellX - boundsMinX) * cellSizePx,
    top: (cellY - boundsMinY) * cellSizePx,
    width: cellSizePx,
    height: cellSizePx,
  }
}

/**
 * Returns a transform that pans just enough so `target` lies inside the
 * visible viewport (with optional padding). Scale is unchanged. If the
 * target is already fully visible, returns the same transform object.
 */
export function transformToShowRect(
  transform: PuzzleViewportTransform,
  contentWidth: number,
  contentHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  target: ContentRect,
  padding = 0,
): PuzzleViewportTransform {
  const visible = getVisibleContentRect(
    transform,
    contentWidth,
    contentHeight,
    viewportWidth,
    viewportHeight,
  )

  let left = visible.left
  let top = visible.top

  const targetLeft = target.left - padding
  const targetRight = target.left + target.width + padding
  const targetTop = target.top - padding
  const targetBottom = target.top + target.height + padding

  if (targetLeft < left) {
    left = targetLeft
  } else if (targetRight > left + visible.width) {
    left = targetRight - visible.width
  }

  if (targetTop < top) {
    top = targetTop
  } else if (targetBottom > top + visible.height) {
    top = targetBottom - visible.height
  }

  if (left === visible.left && top === visible.top) {
    return transform
  }

  const contentCenterX = contentWidth / 2
  const contentCenterY = contentHeight / 2

  return {
    ...transform,
    translateX: transform.scale * (contentCenterX - left - visible.width / 2),
    translateY: transform.scale * (contentCenterY - top - visible.height / 2),
  }
}
