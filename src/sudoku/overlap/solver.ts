import { boardsEqual } from '../grid'
import { solveWithHumanTechniques } from '../humanSolver'
import type { HumanSolverOptions } from '../humanSolver'
import type { CellValue, HumanSolveResult } from '../types'
import {
  cloneGlobalBoard,
  readLocalBoard,
  writeLocalBoard,
} from './globalBoard'
import type { GlobalBoard, GridId, OverlapGraph } from './types'

export interface OverlapSolveResult {
  solved: boolean
  board: GlobalBoard
  reason: HumanSolveResult['reason'] | 'overlap-conflict'
  gridResults: Readonly<Record<GridId, HumanSolveResult>>
  passes: number
}

const MAX_PASSES = 64

/**
 * Solve an overlapping puzzle by repeatedly applying the standard human
 * solver to each 9×9 grid, writing placements back into the shared global
 * board. Overlap cells are a single source of truth — a placement that would
 * disagree with an already-filled overlap neighbor is rejected.
 */
export function solveOverlappingWithHumanTechniques(
  globalBoard: GlobalBoard,
  graph: OverlapGraph,
  options: HumanSolverOptions,
): OverlapSolveResult {
  const board = cloneGlobalBoard(globalBoard)
  const gridResults: Record<GridId, HumanSolveResult> = {}

  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    let changed = false
    let allSolved = true

    for (const node of graph.nodes) {
      const before = readLocalBoard(board, graph, node.id)
      const result = solveWithHumanTechniques(before, options)
      gridResults[node.id] = result

      if (result.reason === 'invalid') {
        return {
          solved: false,
          board,
          reason: 'invalid',
          gridResults,
          passes: pass + 1,
        }
      }

      if (!result.solved) {
        allSolved = false
      }

      try {
        if (!boardsEqual(before, result.board)) {
          writeLocalBoard(board, graph, node.id, result.board)
          changed = true
        }
      } catch {
        return {
          solved: false,
          board,
          reason: 'overlap-conflict',
          gridResults,
          passes: pass + 1,
        }
      }
    }

    if (allSolved) {
      return {
        solved: true,
        board,
        reason: 'solved',
        gridResults,
        passes: pass + 1,
      }
    }

    if (!changed) {
      return {
        solved: false,
        board,
        reason: 'stalled',
        gridResults,
        passes: pass + 1,
      }
    }
  }

  return {
    solved: false,
    board,
    reason: 'stalled',
    gridResults,
    passes: MAX_PASSES,
  }
}

/**
 * Validate that a candidate placement on a local grid agrees with any known
 * overlap solution digit. Used by generation / setter helpers.
 */
export function placementMatchesKnownOverlap(
  localCell: number,
  digit: CellValue,
  knownSolution: readonly CellValue[],
): boolean {
  const known = knownSolution[localCell] ?? 0
  return known === 0 || known === digit
}
