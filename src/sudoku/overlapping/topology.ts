import { GRID_SIZE } from '../grid'
import {
  collectGridGlobalCells,
  computeSharedGlobalCells,
  isExactOverlap,
  listAttachmentCandidates,
  pointKey,
  sharedCellCountForOverlap,
} from './coordinates'
import type {
  GridNode,
  OverlapBoxes,
  OverlapEdge,
  OverlapTopology,
} from './types'

export const MAX_OVERLAPPING_GRIDS = 10

function computeBounds(grids: readonly GridNode[]) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const grid of grids) {
    minX = Math.min(minX, grid.origin.x)
    minY = Math.min(minY, grid.origin.y)
    maxX = Math.max(maxX, grid.origin.x + GRID_SIZE)
    maxY = Math.max(maxY, grid.origin.y + GRID_SIZE)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function createEdge(
  from: GridNode,
  to: GridNode,
  overlapBoxes: OverlapBoxes,
): OverlapEdge | null {
  if (!isExactOverlap(from.origin, to.origin, overlapBoxes)) {
    return null
  }

  return {
    from: from.id,
    to: to.id,
    overlapBoxes,
    sharedGlobalCells: computeSharedGlobalCells(from.origin, to.origin),
  }
}

/**
 * Returns true when `candidate` may be added without colliding with any
 * existing grid except an exact N-box overlap with `parent`.
 */
export function canPlaceGrid(
  existing: readonly GridNode[],
  parent: GridNode,
  candidateOrigin: { x: number; y: number },
  overlapBoxes: OverlapBoxes,
): boolean {
  if (!isExactOverlap(parent.origin, candidateOrigin, overlapBoxes)) {
    return false
  }

  const expectedShared = new Set(
    computeSharedGlobalCells(parent.origin, candidateOrigin).map((point) =>
      pointKey(point.x, point.y),
    ),
  )
  const candidateCells = collectGridGlobalCells(candidateOrigin)

  for (const grid of existing) {
    const intersection = candidateCells.filter((point) => {
      const localX = point.x - grid.origin.x
      const localY = point.y - grid.origin.y
      return (
        localX >= 0 &&
        localX < GRID_SIZE &&
        localY >= 0 &&
        localY < GRID_SIZE
      )
    })

    if (intersection.length === 0) {
      continue
    }

    if (grid.id === parent.id) {
      if (intersection.length !== sharedCellCountForOverlap(overlapBoxes)) {
        return false
      }
      const allExpected = intersection.every((point) =>
        expectedShared.has(pointKey(point.x, point.y)),
      )
      if (!allExpected) {
        return false
      }
      continue
    }

    // May only touch non-parent grids via a valid exact overlap as well
    // (multi-parent topologies), otherwise reject.
    if (!isExactOverlap(grid.origin, candidateOrigin, overlapBoxes)) {
      return false
    }
  }

  // Reject identical duplicate placement.
  return !existing.some(
    (grid) =>
      grid.origin.x === candidateOrigin.x && grid.origin.y === candidateOrigin.y,
  )
}

/**
 * Build a connected overlapping topology by spiraling outward from a center
 * grid. Attachment order prefers east/south/west/north laterals in rotation so
 * layouts grow symmetrically for 1-, 2-, and 3-box overlaps.
 */
export function buildSpiralTopology(
  overlapBoxes: OverlapBoxes,
  gridCount: number,
): OverlapTopology {
  if (gridCount < 1 || gridCount > MAX_OVERLAPPING_GRIDS) {
    throw new Error(
      `Overlapping puzzles support 1–${MAX_OVERLAPPING_GRIDS} grids.`,
    )
  }
  if (overlapBoxes !== 1 && overlapBoxes !== 2 && overlapBoxes !== 3) {
    throw new Error('Overlap must be 1, 2, or 3 boxes.')
  }

  const grids: GridNode[] = [{ id: 0, origin: { x: 0, y: 0 } }]
  const edges: OverlapEdge[] = []

  if (gridCount === 1) {
    return {
      overlapBoxes,
      grids,
      edges,
      bounds: computeBounds(grids),
    }
  }

  let nextId = 1
  const queue = [0]

  while (grids.length < gridCount && queue.length > 0) {
    const parentId = queue.shift()!
    const parent = grids[parentId]!
    const candidates = listAttachmentCandidates(parent, overlapBoxes)

    for (const candidate of candidates) {
      if (grids.length >= gridCount) {
        break
      }
      if (!canPlaceGrid(grids, parent, candidate.origin, overlapBoxes)) {
        continue
      }

      const node: GridNode = { id: nextId, origin: candidate.origin }
      const edge = createEdge(parent, node, overlapBoxes)
      if (!edge) {
        continue
      }

      grids.push(node)
      edges.push(edge)
      queue.push(nextId)
      nextId += 1
    }
  }

  if (grids.length < gridCount) {
    throw new Error(
      `Could only place ${grids.length} of ${gridCount} grids at ${overlapBoxes}-box overlap.`,
    )
  }

  // Add any extra exact-overlap edges that formed between non-parent pairs.
  for (let i = 0; i < grids.length; i += 1) {
    for (let j = i + 1; j < grids.length; j += 1) {
      const alreadyLinked = edges.some(
        (edge) =>
          (edge.from === grids[i]!.id && edge.to === grids[j]!.id) ||
          (edge.from === grids[j]!.id && edge.to === grids[i]!.id),
      )
      if (alreadyLinked) {
        continue
      }
      const edge = createEdge(grids[i]!, grids[j]!, overlapBoxes)
      if (edge) {
        edges.push(edge)
      }
    }
  }

  return {
    overlapBoxes,
    grids,
    edges,
    bounds: computeBounds(grids),
  }
}

/** Preset matching the 1-box reference topology (6 grids). */
export function createOneBoxSixGridTopology(): OverlapTopology {
  return buildSpiralTopology(1, 6)
}

/** Preset matching the 2-box reference topology (7 grids). */
export function createTwoBoxSevenGridTopology(): OverlapTopology {
  return buildSpiralTopology(2, 7)
}

/** Preset matching the 3-box reference topology (7 grids). */
export function createThreeBoxSevenGridTopology(): OverlapTopology {
  return buildSpiralTopology(3, 7)
}

export function getOverlapGlobalKeys(
  topology: OverlapTopology,
): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const edge of topology.edges) {
    for (const point of edge.sharedGlobalCells) {
      keys.add(`${point.x},${point.y}`)
    }
  }
  return keys
}

export function getUniqueGlobalCellCount(topology: OverlapTopology): number {
  const keys = new Set<string>()
  for (const grid of topology.grids) {
    for (const point of collectGridGlobalCells(grid.origin)) {
      keys.add(`${point.x},${point.y}`)
    }
  }
  return keys.size
}
