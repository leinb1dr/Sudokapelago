import { BOX_SIZE, GRID_SIZE } from '../grid'
import { gridContainsPoint, pointKey } from './coordinates'
import type { GlobalPoint, OverlapTopology } from './types'

/** Border drawn by the cell itself (board perimeters use outline overlays). */
export type CellEdgeStyle = 'none' | 'thin' | 'box'

export interface UnifiedCellBorders {
  right: CellEdgeStyle
  bottom: CellEdgeStyle
}

/** Build the set of global cells that belong to at least one logical board. */
export function buildOccupiedCellKeys(topology: OverlapTopology): Set<string> {
  const occupied = new Set<string>()
  for (const grid of topology.grids) {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        occupied.add(
          pointKey(grid.origin.x + column, grid.origin.y + row),
        )
      }
    }
  }
  return occupied
}

export function isCellOccupied(
  occupied: ReadonlySet<string>,
  x: number,
  y: number,
): boolean {
  return occupied.has(pointKey(x, y))
}

/**
 * True when the vertical line to the right of `(x, y)` lies on the outer
 * perimeter of any logical 9×9 board (drawn by an outline overlay).
 */
export function isBoardPerimeterVertical(
  topology: OverlapTopology,
  x: number,
  y: number,
): boolean {
  for (const grid of topology.grids) {
    const { origin } = grid
    if (y < origin.y || y >= origin.y + GRID_SIZE) {
      continue
    }
    // Right outer edge of this board, or left outer edge (line left of origin.x).
    if (x === origin.x + GRID_SIZE - 1 || x === origin.x - 1) {
      return true
    }
  }
  return false
}

/**
 * True when the horizontal line below `(x, y)` lies on the outer perimeter of
 * any logical 9×9 board.
 */
export function isBoardPerimeterHorizontal(
  topology: OverlapTopology,
  x: number,
  y: number,
): boolean {
  for (const grid of topology.grids) {
    const { origin } = grid
    if (x < origin.x || x >= origin.x + GRID_SIZE) {
      continue
    }
    if (y === origin.y + GRID_SIZE - 1 || y === origin.y - 1) {
      return true
    }
  }
  return false
}

function isInternalBoxBoundaryVertical(
  topology: OverlapTopology,
  x: number,
  y: number,
): boolean {
  for (const grid of topology.grids) {
    if (!gridContainsPoint(grid, { x, y })) {
      continue
    }
    const localColumn = x - grid.origin.x
    if (
      (localColumn + 1) % BOX_SIZE === 0 &&
      localColumn < GRID_SIZE - 1
    ) {
      return true
    }
  }
  return false
}

function isInternalBoxBoundaryHorizontal(
  topology: OverlapTopology,
  x: number,
  y: number,
): boolean {
  for (const grid of topology.grids) {
    if (!gridContainsPoint(grid, { x, y })) {
      continue
    }
    const localRow = y - grid.origin.y
    if ((localRow + 1) % BOX_SIZE === 0 && localRow < GRID_SIZE - 1) {
      return true
    }
  }
  return false
}

/**
 * Right/bottom border styles for an occupied cell. Perimeter edges are omitted
 * so logical-board outline overlays can draw the thick frames once.
 */
export function getUnifiedCellBorders(
  topology: OverlapTopology,
  occupied: ReadonlySet<string>,
  x: number,
  y: number,
): UnifiedCellBorders {
  if (!isCellOccupied(occupied, x, y)) {
    return { right: 'none', bottom: 'none' }
  }

  let right: CellEdgeStyle = 'none'
  if (!isBoardPerimeterVertical(topology, x, y)) {
    if (isInternalBoxBoundaryVertical(topology, x, y)) {
      right = 'box'
    } else if (isCellOccupied(occupied, x + 1, y)) {
      right = 'thin'
    }
  }

  let bottom: CellEdgeStyle = 'none'
  if (!isBoardPerimeterHorizontal(topology, x, y)) {
    if (isInternalBoxBoundaryHorizontal(topology, x, y)) {
      bottom = 'box'
    } else if (isCellOccupied(occupied, x, y + 1)) {
      bottom = 'thin'
    }
  }

  return { right, bottom }
}

/** Inclusive logical board rectangle in global cell coordinates. */
export function getLogicalBoardRect(origin: GlobalPoint): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  return {
    minX: origin.x,
    minY: origin.y,
    maxX: origin.x + GRID_SIZE - 1,
    maxY: origin.y + GRID_SIZE - 1,
  }
}

/**
 * Walk from an occupied cell in a cardinal direction, skipping holes, until
 * the next occupied cell or the topology bounds are exhausted.
 */
export function findNextOccupiedCell(
  topology: OverlapTopology,
  occupied: ReadonlySet<string>,
  start: GlobalPoint,
  deltaX: number,
  deltaY: number,
): GlobalPoint | null {
  const { minX, minY, maxX, maxY } = topology.bounds
  let x = start.x + deltaX
  let y = start.y + deltaY

  while (x >= minX && x < maxX && y >= minY && y < maxY) {
    if (isCellOccupied(occupied, x, y)) {
      return { x, y }
    }
    x += deltaX
    y += deltaY
  }

  return null
}
