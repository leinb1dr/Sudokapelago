import { CELL_COUNT } from '../grid'
import type { Board, CellValue } from '../types'
import {
  collectGridGlobalCells,
  globalToLocal,
  localToGlobal,
  pointKey,
} from './coordinates'
import type { GlobalBoard, GlobalPoint, GridNode, OverlapTopology } from './types'

export function createEmptyGlobalBoard(): GlobalBoard {
  return new Map()
}

export function setGlobalCell(
  board: GlobalBoard,
  point: GlobalPoint,
  value: CellValue,
): void {
  board.set(pointKey(point.x, point.y), value)
}

export function getGlobalCell(
  board: GlobalBoard,
  point: GlobalPoint,
): CellValue {
  return board.get(pointKey(point.x, point.y)) ?? 0
}

export function cloneGlobalBoard(board: GlobalBoard): GlobalBoard {
  return new Map(board)
}

export function extractLocalBoard(
  globalBoard: GlobalBoard,
  grid: GridNode,
): CellValue[] {
  const local = Array<CellValue>(CELL_COUNT).fill(0)
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const point = localToGlobal(grid.origin, cell)
    local[cell] = getGlobalCell(globalBoard, point)
  }
  return local
}

export function writeLocalBoard(
  globalBoard: GlobalBoard,
  grid: GridNode,
  localBoard: Board,
): void {
  if (localBoard.length !== CELL_COUNT) {
    throw new Error('Local board must contain 81 cells.')
  }
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const point = localToGlobal(grid.origin, cell)
    setGlobalCell(globalBoard, point, localBoard[cell]!)
  }
}

export function mergeLocalSolution(
  globalBoard: GlobalBoard,
  grid: GridNode,
  localBoard: Board,
  fixedOnly = false,
): void {
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const point = localToGlobal(grid.origin, cell)
    const existing = getGlobalCell(globalBoard, point)
    const next = localBoard[cell]!
    if (fixedOnly && existing !== 0) {
      if (existing !== next) {
        throw new Error(
          `Overlap conflict at (${point.x},${point.y}): ${existing} vs ${next}`,
        )
      }
      continue
    }
    if (existing !== 0 && existing !== next) {
      throw new Error(
        `Global cell conflict at (${point.x},${point.y}): ${existing} vs ${next}`,
      )
    }
    setGlobalCell(globalBoard, point, next)
  }
}

export function countGlobalClues(board: GlobalBoard): number {
  let count = 0
  for (const value of board.values()) {
    if (value !== 0) {
      count += 1
    }
  }
  return count
}

export function listUniqueGlobalPoints(
  topology: OverlapTopology,
): GlobalPoint[] {
  const seen = new Set<string>()
  const points: GlobalPoint[] = []
  for (const grid of topology.grids) {
    for (const point of collectGridGlobalCells(grid.origin)) {
      const key = pointKey(point.x, point.y)
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      points.push(point)
    }
  }
  return points
}

export function globalBoardsEqual(left: GlobalBoard, right: GlobalBoard): boolean {
  if (left.size !== right.size) {
    return false
  }
  for (const [key, value] of left) {
    if (right.get(key) !== value) {
      return false
    }
  }
  return true
}

export function overlapFixedCellsForGrid(
  topology: OverlapTopology,
  grid: GridNode,
  globalSolution: GlobalBoard,
): { cell: number; digit: import('../types').Digit }[] {
  const fixed: { cell: number; digit: import('../types').Digit }[] = []
  const seen = new Set<number>()

  for (const edge of topology.edges) {
    if (edge.from !== grid.id && edge.to !== grid.id) {
      continue
    }
    for (const point of edge.sharedGlobalCells) {
      const local = globalToLocal(grid.origin, point)
      if (local === null || seen.has(local)) {
        continue
      }
      const digit = getGlobalCell(globalSolution, point)
      if (digit === 0) {
        continue
      }
      seen.add(local)
      fixed.push({ cell: local, digit: digit as import('../types').Digit })
    }
  }

  return fixed
}
