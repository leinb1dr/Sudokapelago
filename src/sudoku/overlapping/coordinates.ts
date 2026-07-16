import { BOX_SIZE, GRID_SIZE } from '../grid'
import type { GlobalPoint, GridId, GridNode, OverlapBoxes } from './types'

export function pointKey(x: number, y: number): string {
  return `${x},${y}`
}

export function parsePointKey(key: string): GlobalPoint {
  const [xText, yText] = key.split(',')
  return { x: Number(xText), y: Number(yText) }
}

export function localToGlobal(
  origin: GlobalPoint,
  localCell: number,
): GlobalPoint {
  const row = Math.floor(localCell / GRID_SIZE)
  const column = localCell % GRID_SIZE
  return { x: origin.x + column, y: origin.y + row }
}

export function globalToLocal(
  origin: GlobalPoint,
  point: GlobalPoint,
): number | null {
  const column = point.x - origin.x
  const row = point.y - origin.y
  if (
    column < 0 ||
    column >= GRID_SIZE ||
    row < 0 ||
    row >= GRID_SIZE
  ) {
    return null
  }
  return row * GRID_SIZE + column
}

export function gridContainsPoint(grid: GridNode, point: GlobalPoint): boolean {
  return globalToLocal(grid.origin, point) !== null
}

/**
 * Lateral offset (in cells) required so two edge-adjacent grids share exactly
 * `overlapBoxes` boxes. Primary axis always shifts by 6 (one box-column/row).
 */
export function lateralOffsetForOverlap(overlapBoxes: OverlapBoxes): number {
  return (3 - overlapBoxes) * BOX_SIZE
}

export type CardinalDirection = 'east' | 'west' | 'north' | 'south'

export interface AttachmentCandidate {
  direction: CardinalDirection
  /** Signed lateral shift perpendicular to the connection axis. */
  lateral: number
  origin: GlobalPoint
}

/**
 * All legal placements of a neighbor grid that share exactly `overlapBoxes`
 * boxes with `parent` along one edge.
 */
export function listAttachmentCandidates(
  parent: GridNode,
  overlapBoxes: OverlapBoxes,
): AttachmentCandidate[] {
  const lateralMagnitude = lateralOffsetForOverlap(overlapBoxes)
  const laterals =
    lateralMagnitude === 0 ? [0] : [-lateralMagnitude, lateralMagnitude]
  const shift = GRID_SIZE - BOX_SIZE
  const candidates: AttachmentCandidate[] = []

  for (const lateral of laterals) {
    candidates.push(
      {
        direction: 'east',
        lateral,
        origin: { x: parent.origin.x + shift, y: parent.origin.y + lateral },
      },
      {
        direction: 'west',
        lateral,
        origin: { x: parent.origin.x - shift, y: parent.origin.y + lateral },
      },
      {
        direction: 'south',
        lateral,
        origin: { x: parent.origin.x + lateral, y: parent.origin.y + shift },
      },
      {
        direction: 'north',
        lateral,
        origin: { x: parent.origin.x + lateral, y: parent.origin.y - shift },
      },
    )
  }

  return candidates
}

/** Global cells shared by two grids whose origins form a valid N-box overlap. */
export function computeSharedGlobalCells(
  originA: GlobalPoint,
  originB: GlobalPoint,
): GlobalPoint[] {
  const minX = Math.max(originA.x, originB.x)
  const minY = Math.max(originA.y, originB.y)
  const maxX = Math.min(originA.x + GRID_SIZE, originB.x + GRID_SIZE)
  const maxY = Math.min(originA.y + GRID_SIZE, originB.y + GRID_SIZE)

  if (maxX <= minX || maxY <= minY) {
    return []
  }

  const shared: GlobalPoint[] = []
  for (let y = minY; y < maxY; y += 1) {
    for (let x = minX; x < maxX; x += 1) {
      shared.push({ x, y })
    }
  }
  return shared
}

export function sharedCellCountForOverlap(overlapBoxes: OverlapBoxes): number {
  return overlapBoxes * BOX_SIZE * BOX_SIZE
}

export function isExactOverlap(
  originA: GlobalPoint,
  originB: GlobalPoint,
  overlapBoxes: OverlapBoxes,
): boolean {
  const shared = computeSharedGlobalCells(originA, originB)
  return shared.length === sharedCellCountForOverlap(overlapBoxes)
}

export function collectGridGlobalCells(origin: GlobalPoint): GlobalPoint[] {
  const cells: GlobalPoint[] = []
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      cells.push({ x: origin.x + column, y: origin.y + row })
    }
  }
  return cells
}

export function findGridAtPoint(
  grids: readonly GridNode[],
  point: GlobalPoint,
): GridId | null {
  for (const grid of grids) {
    if (gridContainsPoint(grid, point)) {
      return grid.id
    }
  }
  return null
}
