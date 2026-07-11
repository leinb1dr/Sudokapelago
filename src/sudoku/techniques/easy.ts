import {
  BOXES,
  COLUMNS,
  DIGITS,
  ROWS,
  singleDigitFromMask,
} from '../grid'
import { placeDigit, resultFromCounts } from '../solverState'
import type { SolverState, TechniqueResult } from '../types'
import { candidateCells } from './utils'

export function applyNakedSingles(state: SolverState): TechniqueResult {
  for (let cell = 0; cell < state.board.length; cell += 1) {
    if (state.board[cell] !== 0) {
      continue
    }

    const digit = singleDigitFromMask(state.candidates[cell])
    if (digit !== null) {
      return placeDigit(state, cell, digit)
    }
  }

  return resultFromCounts()
}

export function applyHiddenSingles(state: SolverState): TechniqueResult {
  for (const unit of [...ROWS, ...COLUMNS]) {
    for (const digit of DIGITS) {
      const cells = candidateCells(state, unit, digit)
      if (cells.length === 1) {
        return placeDigit(state, cells[0], digit)
      }
    }
  }

  return resultFromCounts()
}

export function applyCrossHatching(state: SolverState): TechniqueResult {
  for (const box of BOXES) {
    for (const digit of DIGITS) {
      const cells = candidateCells(state, box, digit)
      if (cells.length === 1) {
        return placeDigit(state, cells[0], digit)
      }
    }
  }

  return resultFromCounts()
}
