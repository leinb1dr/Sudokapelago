import { BOX_SIZE, CELL_COUNT, GRID_SIZE, getColumn, getRow } from '../grid'
import type {
  BoundingBox,
  GlobalCellCoord,
  GridId,
  GridNode,
  OverlapBoxes,
  OverlapEdge,
  OverlapGraph,
} from './types'

export function localToGlobal(
  node: GridNode,
  localCell: number,
): GlobalCellCoord {
  return {
    row: node.originRow + getRow(localCell),
    col: node.originCol + getColumn(localCell),
  }
}

export function globalToLocal(
  node: GridNode,
  row: number,
  col: number,
): number | null {
  const localRow = row - node.originRow
  const localCol = col - node.originCol
  if (
    localRow < 0 ||
    localCol < 0 ||
    localRow >= GRID_SIZE ||
    localCol >= GRID_SIZE
  ) {
    return null
  }
  return localRow * GRID_SIZE + localCol
}

export function globalIndex(bounds: BoundingBox, row: number, col: number): number {
  return (row - bounds.minRow) * bounds.cols + (col - bounds.minCol)
}

export function indexToGlobal(
  bounds: BoundingBox,
  index: number,
): GlobalCellCoord {
  return {
    row: bounds.minRow + Math.floor(index / bounds.cols),
    col: bounds.minCol + (index % bounds.cols),
  }
}

export function computeBounds(nodes: readonly GridNode[]): BoundingBox {
  if (nodes.length === 0) {
    return { minRow: 0, minCol: 0, rows: 0, cols: 0 }
  }

  let minRow = Infinity
  let minCol = Infinity
  let maxRow = -Infinity
  let maxCol = -Infinity

  for (const node of nodes) {
    minRow = Math.min(minRow, node.originRow)
    minCol = Math.min(minCol, node.originCol)
    maxRow = Math.max(maxRow, node.originRow + GRID_SIZE - 1)
    maxCol = Math.max(maxCol, node.originCol + GRID_SIZE - 1)
  }

  return {
    minRow,
    minCol,
    rows: maxRow - minRow + 1,
    cols: maxCol - minCol + 1,
  }
}

/** Encode a global cell as a stable string key. */
export function cellKey(row: number, col: number): string {
  return `${row},${col}`
}

/**
 * Build the set of global cells that belong to more than one grid.
 */
export function findOverlapGlobalKeys(
  nodes: readonly GridNode[],
): ReadonlySet<string> {
  const occupancy = new Map<string, number>()

  for (const node of nodes) {
    for (let local = 0; local < CELL_COUNT; local += 1) {
      const { row, col } = localToGlobal(node, local)
      const key = cellKey(row, col)
      occupancy.set(key, (occupancy.get(key) ?? 0) + 1)
    }
  }

  return new Set(
    [...occupancy.entries()]
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
  )
}

export function isOverlapLocalCell(
  node: GridNode,
  localCell: number,
  overlapKeys: ReadonlySet<string>,
): boolean {
  const { row, col } = localToGlobal(node, localCell)
  return overlapKeys.has(cellKey(row, col))
}

/**
 * Given two grid origins, collect pairwise local cells that share a global
 * coordinate. Returns null when the grids do not overlap.
 */
export function sharedCellsBetween(
  from: GridNode,
  to: GridNode,
): { sharedCells: number[]; toSharedCells: number[] } | null {
  const sharedCells: number[] = []
  const toSharedCells: number[] = []

  for (let local = 0; local < CELL_COUNT; local += 1) {
    const { row, col } = localToGlobal(from, local)
    const toLocal = globalToLocal(to, row, col)
    if (toLocal !== null) {
      sharedCells.push(local)
      toSharedCells.push(toLocal)
    }
  }

  if (sharedCells.length === 0) {
    return null
  }

  return { sharedCells, toSharedCells }
}

export function overlapBoxesFromSharedCount(sharedCellCount: number): OverlapBoxes {
  const boxes = sharedCellCount / (BOX_SIZE * BOX_SIZE)
  if (boxes === 1 || boxes === 2 || boxes === 3) {
    return boxes
  }
  // Non-rectangular or multi-band overlaps (e.g. 4 boxes) still report the
  // nearest supported level for UI / protection heuristics.
  if (boxes < 1.5) {
    return 1
  }
  if (boxes < 2.5) {
    return 2
  }
  return 3
}

export function buildEdges(nodes: readonly GridNode[]): OverlapEdge[] {
  const edges: OverlapEdge[] = []

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const from = nodes[i]
      const to = nodes[j]
      const shared = sharedCellsBetween(from, to)
      if (!shared) {
        continue
      }
      edges.push({
        from: from.id,
        to: to.id,
        overlapBoxes: overlapBoxesFromSharedCount(shared.sharedCells.length),
        sharedCells: shared.sharedCells,
        toSharedCells: shared.toSharedCells,
      })
    }
  }

  return edges
}

export function createOverlapGraph(nodes: readonly GridNode[]): OverlapGraph {
  if (nodes.length > 10) {
    throw new Error('Overlapping puzzles support at most 10 interconnected grids.')
  }
  if (nodes.length === 0) {
    throw new Error('An overlap graph requires at least one grid.')
  }

  const ids = new Set(nodes.map((node) => node.id))
  if (ids.size !== nodes.length) {
    throw new Error('Grid ids must be unique.')
  }

  return {
    nodes,
    edges: buildEdges(nodes),
    bounds: computeBounds(nodes),
  }
}

export function getNode(
  graph: OverlapGraph,
  id: GridId,
): GridNode {
  const node = graph.nodes.find((candidate) => candidate.id === id)
  if (!node) {
    throw new Error(`Unknown grid id: ${id}`)
  }
  return node
}

/** Map of global key → list of { gridId, localCell }. */
export function buildGlobalOccupancy(
  graph: OverlapGraph,
): Map<string, { gridId: GridId; localCell: number }[]> {
  const occupancy = new Map<string, { gridId: GridId; localCell: number }[]>()

  for (const node of graph.nodes) {
    for (let local = 0; local < CELL_COUNT; local += 1) {
      const { row, col } = localToGlobal(node, local)
      const key = cellKey(row, col)
      const owners = occupancy.get(key) ?? []
      owners.push({ gridId: node.id, localCell: local })
      occupancy.set(key, owners)
    }
  }

  return occupancy
}
