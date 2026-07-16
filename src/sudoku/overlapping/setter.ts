import { boardsEqual } from '../grid'
import { shuffle, type RandomSource } from '../generator'
import { solveWithHumanTechniques } from '../humanSolver'
import type { CellValue, Difficulty, Digit, SetterAttempt } from '../types'
import {
  cloneGlobalBoard,
  countGlobalClues,
  extractLocalBoard,
  getGlobalCell,
  listUniqueGlobalPoints,
  setGlobalCell,
  writeLocalBoard,
} from './globalBoard'
import { getOverlapGlobalKeys } from './topology'
import { solveWithOverlapValidation } from './overlapSolver'
import type {
  GlobalBoard,
  GlobalPoint,
  OverlapTopology,
  OverlappingSudokuPuzzle,
} from './types'
import { globalToLocal, pointKey } from './coordinates'

export interface OverlappingSetterOptions {
  difficulty: Difficulty
  random?: RandomSource
  /**
   * When true (default), overlap cells are attempted only after every
   * non-overlap cell has been considered — protecting structural bottlenecks.
   */
  protectOverlaps?: boolean
}

function knownOverlapForGrid(
  topology: OverlapTopology,
  gridId: number,
  solution: GlobalBoard,
): Map<number, Digit> {
  const grid = topology.grids.find((node) => node.id === gridId)
  if (!grid) {
    return new Map()
  }

  const known = new Map<number, Digit>()
  for (const edge of topology.edges) {
    if (edge.from !== gridId && edge.to !== gridId) {
      continue
    }
    for (const point of edge.sharedGlobalCells) {
      const local = globalToLocal(grid.origin, point)
      if (local === null) {
        continue
      }
      const digit = getGlobalCell(solution, point)
      if (digit !== 0) {
        known.set(local, digit as Digit)
      }
    }
  }
  return known
}

function gridIdsTouchingPoint(
  topology: OverlapTopology,
  point: GlobalPoint,
): number[] {
  return topology.grids
    .filter((grid) => globalToLocal(grid.origin, point) !== null)
    .map((grid) => grid.id)
}

function verifyGridsHumanSolvable(
  puzzle: GlobalBoard,
  solution: GlobalBoard,
  topology: OverlapTopology,
  gridIds: readonly number[],
  difficulty: Difficulty,
): { ok: boolean; solveSteps: number } {
  let solveSteps = 0

  for (const gridId of gridIds) {
    const grid = topology.grids.find((node) => node.id === gridId)!
    const localPuzzle = extractLocalBoard(puzzle, grid)
    const localSolution = extractLocalBoard(solution, grid)
    const knownOverlap = knownOverlapForGrid(topology, gridId, solution)
    const result = solveWithOverlapValidation(
      localPuzzle,
      knownOverlap,
      { difficulty },
    )
    solveSteps += result.steps.length

    if (!result.solved || !boardsEqual(result.board, localSolution)) {
      return { ok: false, solveSteps }
    }
  }

  return { ok: true, solveSteps }
}

/**
 * Removes clues from an overlapping puzzle. Non-overlap (outer) cells are
 * stripped first so overlapping bottlenecks stay denser and uniqueness holds.
 */
export function removeCluesFromOverlappingPuzzle(
  topology: OverlapTopology,
  solution: GlobalBoard,
  options: OverlappingSetterOptions,
): Pick<OverlappingSudokuPuzzle, 'puzzle' | 'attempts' | 'clues'> {
  const random = options.random ?? Math.random
  const protectOverlaps = options.protectOverlaps ?? true
  const puzzle = cloneGlobalBoard(solution)
  const attempts: SetterAttempt[] = []
  const overlapKeys = getOverlapGlobalKeys(topology)
  const allPoints = listUniqueGlobalPoints(topology)

  const nonOverlap = allPoints.filter(
    (point) => !overlapKeys.has(pointKey(point.x, point.y)),
  )
  const overlap = allPoints.filter((point) =>
    overlapKeys.has(pointKey(point.x, point.y)),
  )

  const removalOrder = protectOverlaps
    ? [...shuffle(nonOverlap, random), ...shuffle(overlap, random)]
    : shuffle(allPoints, random)

  for (const point of removalOrder) {
    const digit = getGlobalCell(puzzle, point)
    if (digit === 0) {
      continue
    }

    setGlobalCell(puzzle, point, 0)
    const touched = gridIdsTouchingPoint(topology, point)
    const verification = verifyGridsHumanSolvable(
      puzzle,
      solution,
      topology,
      touched,
      options.difficulty,
    )

    // Represent attempts with a stable local index from the first owning grid.
    const owner = topology.grids.find((grid) =>
      touched.includes(grid.id),
    )!
    const localCell = globalToLocal(owner.origin, point)!

    if (!verification.ok) {
      setGlobalCell(puzzle, point, digit)
      attempts.push({
        cell: localCell,
        digit: digit as Digit,
        accepted: false,
        solveSteps: verification.solveSteps,
      })
      continue
    }

    attempts.push({
      cell: localCell,
      digit: digit as Digit,
      accepted: true,
      solveSteps: verification.solveSteps,
    })
  }

  return {
    puzzle,
    attempts,
    clues: countGlobalClues(puzzle),
  }
}

/** Convenience: human-solve every grid of an overlapping puzzle in place. */
export function solveOverlappingPuzzle(
  topology: OverlapTopology,
  puzzle: GlobalBoard,
  difficulty: Difficulty,
): { solved: boolean; board: GlobalBoard } {
  const board = cloneGlobalBoard(puzzle)
  let progress = true

  while (progress) {
    progress = false
    for (const grid of topology.grids) {
      const local = extractLocalBoard(board, grid)
      if (local.every((value) => value !== 0)) {
        continue
      }
      const knownOverlap = knownOverlapForGrid(topology, grid.id, board)
      // Seed known overlap from current board givens only for validation of
      // already-filled overlap cells; empty overlap cells are free.
      const result = solveWithHumanTechniques(local, { difficulty })
      if (
        result.reason === 'invalid' ||
        !boardRespectsFilledOverlap(result.board, knownOverlap)
      ) {
        return { solved: false, board }
      }
      if (!boardsEqual(result.board, local)) {
        writeLocalBoard(board, grid, result.board)
        progress = true
      }
    }
  }

  const solved = listUniqueGlobalPoints(topology).every(
    (point) => getGlobalCell(board, point) !== 0,
  )
  return { solved, board }
}

function boardRespectsFilledOverlap(
  board: readonly CellValue[],
  knownOverlap: ReadonlyMap<number, Digit>,
): boolean {
  for (const [cell, digit] of knownOverlap) {
    if (board[cell] !== 0 && board[cell] !== digit) {
      return false
    }
  }
  return true
}
