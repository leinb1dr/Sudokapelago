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
import type {
  ConstrainedFillRequest,
  ConstrainedFillResult,
  FixedOverlapCell,
} from './types'

/**
 * Validates a prospective placement against known overlap solution digits.
 * Conflicts force the same kind of backtrack as an unsolvable path.
 */
export function isPlacementValidForOverlap(
  cell: number,
  digit: Digit,
  knownOverlap: ReadonlyMap<number, Digit>,
): boolean {
  const expected = knownOverlap.get(cell)
  return expected === undefined || expected === digit
}

function applyFixedCells(
  board: CellValue[],
  fixedCells: readonly FixedOverlapCell[],
  knownOverlap: Map<number, Digit>,
): boolean {
  for (const { cell, digit } of fixedCells) {
    if (cell < 0 || cell >= CELL_COUNT || digit < 1 || digit > 9) {
      return false
    }
    if (board[cell] !== 0 && board[cell] !== digit) {
      return false
    }
    if (!isPlacementValidForOverlap(cell, digit, knownOverlap)) {
      return false
    }
    board[cell] = digit
    knownOverlap.set(cell, digit)
  }
  return isValidBoard(board)
}

function findNextEmptyCell(board: readonly CellValue[]): number {
  let bestCell = -1
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

function canPlace(
  board: readonly CellValue[],
  cell: number,
  digit: Digit,
): boolean {
  if (board[cell] !== 0) {
    return board[cell] === digit
  }
  return PEERS[cell].every((peer) => board[peer] !== digit)
}

/**
 * Fills a 9×9 board so every fixed overlap cell matches the known solution.
 * Uses MRV backtracking; overlap mismatches are rejected immediately.
 */
export function fillBoardWithOverlapConstraints(
  fixedCells: readonly FixedOverlapCell[],
  random: RandomSource = Math.random,
): ConstrainedFillResult {
  const board = Array<CellValue>(CELL_COUNT).fill(0)
  const knownOverlap = new Map<number, Digit>()

  if (!applyFixedCells(board, fixedCells, knownOverlap)) {
    return { ok: false, board: null, reason: 'overlap-conflict' }
  }

  function search(): boolean {
    const cell = findNextEmptyCell(board)
    if (cell === -1) {
      return isSolvedBoard(board)
    }

    const candidates = shuffle(
      DIGITS.filter(
        (digit) =>
          canPlace(board, cell, digit) &&
          isPlacementValidForOverlap(cell, digit, knownOverlap),
      ),
      random,
    )

    for (const digit of candidates) {
      board[cell] = digit
      if (search()) {
        return true
      }
      board[cell] = 0
    }

    return false
  }

  if (!search()) {
    return { ok: false, board: null, reason: 'unsolvable' }
  }

  return { ok: true, board: [...board] }
}

export function fillFromRequest(
  request: ConstrainedFillRequest,
  random: RandomSource,
): ConstrainedFillResult {
  return fillBoardWithOverlapConstraints(request.fixedCells, random)
}

/**
 * After a standard human-technique placement, confirm overlap cells still
 * match the known solution. Used as an extra validation gate without changing
 * the base solver implementation.
 */
export function boardRespectsOverlapSolution(
  board: readonly CellValue[],
  knownOverlap: ReadonlyMap<number, Digit>,
): boolean {
  for (const [cell, digit] of knownOverlap) {
    const value = board[cell]
    if (value !== 0 && value !== digit) {
      return false
    }
  }
  return true
}
