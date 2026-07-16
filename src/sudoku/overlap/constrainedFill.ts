import {
  CELL_COUNT,
  DIGITS,
  PEERS,
  getCandidateMask,
  isSolvedBoard,
  isValidBoard,
} from '../grid'
import { shuffle, type RandomSource } from '../generator'
import type { CellValue, Digit } from '../types'

/**
 * Fill a partially constrained 9×9 board with backtracking.
 *
 * `knownSolution` encodes static overlap (or other) digits that must never be
 * contradicted. Pre-filled givens should already match `knownSolution` where
 * both are non-zero. Any digit placed by search is rejected when it conflicts
 * with a non-zero known-solution entry — the same backtrack path as an empty
 * candidate list.
 *
 * This module does not mutate the standard unconstrained generator.
 */
export function fillBoardWithConstraints(
  givens: readonly CellValue[],
  knownSolution: readonly CellValue[],
  random: RandomSource = Math.random,
): CellValue[] | null {
  if (givens.length !== CELL_COUNT || knownSolution.length !== CELL_COUNT) {
    throw new Error('Constrained fill expects 81-cell boards.')
  }

  const board: CellValue[] = [...givens]

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const known = knownSolution[cell]
    if (known !== 0) {
      if (board[cell] === 0) {
        board[cell] = known
      } else if (board[cell] !== known) {
        return null
      }
    }
  }

  if (!isValidBoard(board)) {
    return null
  }

  if (!search(board, knownSolution, random)) {
    return null
  }

  return isSolvedBoard(board) ? board : null
}

function placementConflictsKnownSolution(
  cell: number,
  digit: Digit,
  knownSolution: readonly CellValue[],
): boolean {
  const known = knownSolution[cell]
  return known !== 0 && known !== digit
}

function search(
  board: CellValue[],
  knownSolution: readonly CellValue[],
  random: RandomSource,
): boolean {
  const cell = pickEmptyCell(board)
  if (cell === null) {
    return true
  }

  const mask = getCandidateMask(board, cell)
  const candidates = shuffle(
    DIGITS.filter((digit) => (mask & (1 << digit)) !== 0),
    random,
  )

  for (const digit of candidates) {
    if (placementConflictsKnownSolution(cell, digit, knownSolution)) {
      continue
    }

    if (PEERS[cell].some((peer) => board[peer] === digit)) {
      continue
    }

    board[cell] = digit
    if (search(board, knownSolution, random)) {
      return true
    }
    board[cell] = 0
  }

  return false
}

function pickEmptyCell(board: readonly CellValue[]): number | null {
  let bestCell: number | null = null
  let bestCount = 10

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (board[cell] !== 0) {
      continue
    }
    const count = DIGITS.reduce(
      (total, digit) =>
        total + Number((getCandidateMask(board, cell) & (1 << digit)) !== 0),
      0,
    )
    if (count < bestCount) {
      bestCount = count
      bestCell = cell
      if (count <= 1) {
        break
      }
    }
  }

  return bestCell
}
