import { boardsEqual, countClues } from '../grid'
import { solveWithHumanTechniques } from '../humanSolver'
import type { HumanSolverOptions } from '../humanSolver'
import type { CellValue, Digit, SetterAttempt } from '../types'
import {
  boardRespectsOverlapSolution,
  isPlacementValidForOverlap,
} from './constrainedFill'

/**
 * Runs the standard human solver, then rejects the path when any placement
 * disagrees with a known overlapping-region solution.
 */
export function solveWithOverlapValidation(
  board: CellValue[],
  knownOverlap: ReadonlyMap<number, Digit>,
  options: HumanSolverOptions,
) {
  for (const [cell, digit] of knownOverlap) {
    if (board[cell] !== 0 && board[cell] !== digit) {
      return {
        solved: false,
        board: [...board],
        steps: [],
        reason: 'invalid' as const,
      }
    }
  }

  const result = solveWithHumanTechniques(board, options)
  if (!boardRespectsOverlapSolution(result.board, knownOverlap)) {
    return {
      solved: false,
      board: result.board,
      steps: result.steps,
      reason: 'invalid' as const,
    }
  }

  // Defend against partial fills that left an overlap cell wrong (should be
  // impossible if givens were correct, but keeps the contract explicit).
  for (const [cell, expected] of knownOverlap) {
    const value = result.board[cell]
    if (
      value !== 0 &&
      (value !== expected ||
        !isPlacementValidForOverlap(cell, value as Digit, knownOverlap))
    ) {
      return {
        solved: false,
        board: result.board,
        steps: result.steps,
        reason: 'invalid' as const,
      }
    }
  }

  return result
}

export function tryRemoveClueWithOverlapGuard(
  puzzle: CellValue[],
  solution: readonly CellValue[],
  cell: number,
  knownOverlap: ReadonlyMap<number, Digit>,
  options: HumanSolverOptions,
): SetterAttempt {
  const digit = puzzle[cell]
  if (digit === 0) {
    throw new Error('Only an unattempted clue can be removed.')
  }

  puzzle[cell] = 0
  const solveResult = solveWithOverlapValidation(puzzle, knownOverlap, options)
  const accepted =
    solveResult.solved && boardsEqual(solveResult.board, solution)

  if (!accepted) {
    puzzle[cell] = digit
  }

  return {
    cell,
    digit: digit as Digit,
    accepted,
    solveSteps: solveResult.steps.length,
  }
}

export function countLocalClues(board: readonly CellValue[]): number {
  return countClues(board)
}
