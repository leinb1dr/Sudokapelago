import { CELL_COUNT, boardsEqual, countClues, isSolvedBoard } from './grid'
import {
  generateSolvedBoard,
  shuffle,
} from './generator'
import type { RandomSource } from './generator'
import { solveWithHumanTechniques } from './humanSolver'
import type {
  CellValue,
  Difficulty,
  Digit,
  HumanTechnique,
  SetterAttempt,
  SudokuPuzzle,
} from './types'

export interface SetterOptions {
  difficulty: Difficulty
  random?: RandomSource
  techniques?: readonly HumanTechnique[]
  onAttempt?: (attempt: SetterAttempt, puzzle: readonly CellValue[]) => void
}

interface RemovalOptions {
  difficulty: Difficulty
  techniques?: readonly HumanTechnique[]
}

export function tryRemoveClue(
  puzzle: CellValue[],
  solution: readonly CellValue[],
  cell: number,
  options: RemovalOptions,
): SetterAttempt {
  const digit = puzzle[cell]
  if (digit === 0 || cell < 0 || cell >= CELL_COUNT) {
    throw new Error('Only an unattempted clue can be removed.')
  }

  puzzle[cell] = 0
  const solveResult = solveWithHumanTechniques(puzzle, options)
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

export function createSudokuPuzzle(options: SetterOptions): SudokuPuzzle {
  const random = options.random ?? Math.random
  const solution = generateSolvedBoard(random)
  if (!isSolvedBoard(solution)) {
    throw new Error('Phase 0 did not produce a valid solved Sudoku board.')
  }

  const puzzle = [...solution]
  const attempts: SetterAttempt[] = []
  const removalOrder = shuffle(
    Array.from({ length: CELL_COUNT }, (_, cell) => cell),
    random,
  )

  for (const cell of removalOrder) {
    const attempt = tryRemoveClue(puzzle, solution, cell, options)
    attempts.push(attempt)
    options.onAttempt?.(attempt, [...puzzle])
  }

  return {
    puzzle,
    solution,
    difficulty: options.difficulty,
    attempts,
    clues: countClues(puzzle),
  }
}
