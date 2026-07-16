import { CELL_COUNT, GRID_SIZE } from '../grid'
import type { Board, CellValue } from '../types'
import {
  buildGlobalOccupancy,
  cellKey,
  getNode,
  globalIndex,
  globalToLocal,
  indexToGlobal,
  localToGlobal,
} from './coordinates'
import type {
  GlobalBoard,
  GridId,
  OverlapGraph,
} from './types'

export function createEmptyGlobalBoard(graph: OverlapGraph): (CellValue | null)[] {
  const occupancy = buildGlobalOccupancy(graph)
  const board: (CellValue | null)[] = Array.from(
    { length: graph.bounds.rows * graph.bounds.cols },
    () => null,
  )

  for (const [key] of occupancy) {
    const [rowText, colText] = key.split(',')
    const row = Number(rowText)
    const col = Number(colText)
    board[globalIndex(graph.bounds, row, col)] = 0
  }

  return board
}

export function readLocalBoard(
  globalBoard: GlobalBoard,
  graph: OverlapGraph,
  gridId: GridId,
): CellValue[] {
  const node = getNode(graph, gridId)
  const local: CellValue[] = Array.from({ length: CELL_COUNT }, () => 0)

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const { row, col } = localToGlobal(node, cell)
    const value = globalBoard[globalIndex(graph.bounds, row, col)]
    local[cell] = value === null || value === undefined ? 0 : value
  }

  return local
}

export function writeLocalBoard(
  globalBoard: (CellValue | null)[],
  graph: OverlapGraph,
  gridId: GridId,
  localBoard: Board,
): void {
  const node = getNode(graph, gridId)

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const { row, col } = localToGlobal(node, cell)
    const index = globalIndex(graph.bounds, row, col)
    const existing = globalBoard[index]
    const next = localBoard[cell]

    if (existing !== null && existing !== 0 && existing !== next && next !== 0) {
      throw new Error(
        `Conflicting write at global (${row},${col}): ${existing} vs ${next}`,
      )
    }

    if (next !== 0 || existing === null || existing === 0) {
      globalBoard[index] = next
    }
  }
}

export function setGlobalCell(
  globalBoard: (CellValue | null)[],
  graph: OverlapGraph,
  row: number,
  col: number,
  value: CellValue,
): void {
  const index = globalIndex(graph.bounds, row, col)
  if (globalBoard[index] === null) {
    throw new Error(`Cannot write into a hole at (${row},${col}).`)
  }
  globalBoard[index] = value
}

export function getGlobalCell(
  globalBoard: GlobalBoard,
  graph: OverlapGraph,
  row: number,
  col: number,
): CellValue | null {
  return globalBoard[globalIndex(graph.bounds, row, col)] ?? null
}

/** Collect overlap constraints for `gridId` from an already-filled global solution. */
export function extractOverlapConstraints(
  globalSolution: GlobalBoard,
  graph: OverlapGraph,
  gridId: GridId,
): { givens: CellValue[]; knownSolution: CellValue[] } {
  const node = getNode(graph, gridId)
  const occupancy = buildGlobalOccupancy(graph)
  const givens: CellValue[] = Array.from({ length: CELL_COUNT }, () => 0)
  const knownSolution: CellValue[] = Array.from({ length: CELL_COUNT }, () => 0)

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const { row, col } = localToGlobal(node, cell)
    const key = cellKey(row, col)
    const owners = occupancy.get(key) ?? []
    const value = getGlobalCell(globalSolution, graph, row, col)

    if (owners.length > 1 && value !== null && value !== 0) {
      givens[cell] = value
      knownSolution[cell] = value
    }
  }

  return { givens, knownSolution }
}

export function countGlobalClues(board: GlobalBoard): number {
  return board.reduce<number>(
    (count, value) => count + Number(value !== null && value !== 0),
    0,
  )
}

export function cloneGlobalBoard(board: GlobalBoard): (CellValue | null)[] {
  return [...board]
}

/** Presence mask: true where a real cell exists. */
export function createPresenceMask(graph: OverlapGraph): boolean[] {
  return createEmptyGlobalBoard(graph).map((value) => value !== null)
}

export function gridsContaining(
  graph: OverlapGraph,
  row: number,
  col: number,
): GridId[] {
  return graph.nodes
    .filter((node) => globalToLocal(node, row, col) !== null)
    .map((node) => node.id)
}

export function iterPresentCells(
  graph: OverlapGraph,
): { index: number; row: number; col: number }[] {
  const cells: { index: number; row: number; col: number }[] = []
  const total = graph.bounds.rows * graph.bounds.cols

  for (let index = 0; index < total; index += 1) {
    const { row, col } = indexToGlobal(graph.bounds, index)
    if (gridsContaining(graph, row, col).length > 0) {
      cells.push({ index, row, col })
    }
  }

  return cells
}

export function localCellSize(): number {
  return GRID_SIZE
}
