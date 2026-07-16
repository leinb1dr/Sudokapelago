import { BOX_SIZE, GRID_SIZE } from '../grid'
import {
  globalToLocal,
  gridContainsPoint,
  pointKey,
} from './coordinates'
import type { GlobalPoint, GridNode, OverlapTopology } from './types'

export interface UnifiedCellBorders {
  /** Thin or block border on the right edge shared with another active cell. */
  right: 'none' | 'thin' | 'block'
  /** Thin or block border on the bottom edge shared with another active cell. */
  bottom: 'none' | 'thin' | 'block'
}

/** True when the global cell belongs to at least one logical 9×9 board. */
export function isActiveGlobalCell(
  topology: OverlapTopology,
  point: GlobalPoint,
): boolean {
  return topology.grids.some((grid) => gridContainsPoint(grid, point))
}

export function gridsContainingPoint(
  topology: OverlapTopology,
  point: GlobalPoint,
): readonly GridNode[] {
  return topology.grids.filter((grid) => gridContainsPoint(grid, point))
}

/**
 * Build a set of every global cell key covered by the topology (active cells).
 */
export function buildActiveCellKeySet(
  topology: OverlapTopology,
): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const grid of topology.grids) {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        keys.add(pointKey(grid.origin.x + column, grid.origin.y + row))
      }
    }
  }
  return keys
}

function hasVerticalBlockBoundary(
  topology: OverlapTopology,
  point: GlobalPoint,
  neighbor: GlobalPoint,
): boolean {
  for (const grid of topology.grids) {
    const local = globalToLocal(grid.origin, point)
    const neighborLocal = globalToLocal(grid.origin, neighbor)
    if (local === null || neighborLocal === null) {
      continue
    }
    const column = local % GRID_SIZE
    if ((column + 1) % BOX_SIZE === 0 && column < GRID_SIZE - 1) {
      return true
    }
  }
  return false
}

function hasHorizontalBlockBoundary(
  topology: OverlapTopology,
  point: GlobalPoint,
  neighbor: GlobalPoint,
): boolean {
  for (const grid of topology.grids) {
    const local = globalToLocal(grid.origin, point)
    const neighborLocal = globalToLocal(grid.origin, neighbor)
    if (local === null || neighborLocal === null) {
      continue
    }
    const row = Math.floor(local / GRID_SIZE)
    if ((row + 1) % BOX_SIZE === 0 && row < GRID_SIZE - 1) {
      return true
    }
  }
  return false
}

/**
 * Border styles for one cell in the unified giant grid.
 *
 * Active cells share thin (or 3×3 block) borders with adjacent active cells.
 * Edges that fall on a logical board perimeter are left without a cell border —
 * the thick outline overlay draws those instead, so boards do not stack.
 */
export function getUnifiedCellBorders(
  topology: OverlapTopology,
  point: GlobalPoint,
  activeKeys: ReadonlySet<string>,
): UnifiedCellBorders {
  const key = pointKey(point.x, point.y)
  if (!activeKeys.has(key)) {
    return { right: 'none', bottom: 'none' }
  }

  const rightNeighbor = { x: point.x + 1, y: point.y }
  const bottomNeighbor = { x: point.x, y: point.y + 1 }
  const rightActive = activeKeys.has(pointKey(rightNeighbor.x, rightNeighbor.y))
  const bottomActive = activeKeys.has(
    pointKey(bottomNeighbor.x, bottomNeighbor.y),
  )

  let right: UnifiedCellBorders['right'] = 'none'
  if (rightActive) {
    right = hasVerticalBlockBoundary(topology, point, rightNeighbor)
      ? 'block'
      : 'thin'
  }

  let bottom: UnifiedCellBorders['bottom'] = 'none'
  if (bottomActive) {
    bottom = hasHorizontalBlockBoundary(topology, point, bottomNeighbor)
      ? 'block'
      : 'thin'
  }

  return { right, bottom }
}

/** Pixel/CSS placement of a logical board outline within the unified world. */
export function getBoardOutlineRect(
  topology: OverlapTopology,
  grid: GridNode,
  cellPx: number,
): { left: number; top: number; width: number; height: number } {
  return {
    left: (grid.origin.x - topology.bounds.minX) * cellPx,
    top: (grid.origin.y - topology.bounds.minY) * cellPx,
    width: GRID_SIZE * cellPx,
    height: GRID_SIZE * cellPx,
  }
}

/**
 * Walk from `from` in a cardinal direction to the next active cell within
 * topology bounds. Returns null if none exists (no wrap).
 */
export function findNextActiveCell(
  topology: OverlapTopology,
  from: GlobalPoint,
  deltaX: number,
  deltaY: number,
  activeKeys: ReadonlySet<string>,
): GlobalPoint | null {
  const { minX, minY, maxX, maxY } = topology.bounds
  let x = from.x + deltaX
  let y = from.y + deltaY

  while (x >= minX && x < maxX && y >= minY && y < maxY) {
    if (activeKeys.has(pointKey(x, y))) {
      return { x, y }
    }
    x += deltaX
    y += deltaY
  }

  return null
}
