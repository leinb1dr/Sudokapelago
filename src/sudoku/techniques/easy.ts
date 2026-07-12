import {
  BOXES,
  COLUMNS,
  DIGITS,
  ROWS,
  getBox,
  singleDigitFromMask,
} from '../grid'
import { placeDigit, resultFromCounts } from '../solverState'
import {
  buildCrossHatchDetails,
  buildHiddenSingleDetails,
  buildNakedSingleDetails,
} from '../stepDetails'
import type { SolverState, TechniqueResult } from '../types'
import { candidateCells } from './utils'

export function applyNakedSingles(state: SolverState): TechniqueResult {
  for (let cell = 0; cell < state.board.length; cell += 1) {
    if (state.board[cell] !== 0) {
      continue
    }

    const digit = singleDigitFromMask(state.candidates[cell])
    if (digit !== null) {
      const details = buildNakedSingleDetails(state, cell, digit)
      return {
        ...placeDigit(state, cell, digit),
        details,
      }
    }
  }

  return resultFromCounts()
}

export function applyHiddenSingles(state: SolverState): TechniqueResult {
  for (let rowIndex = 0; rowIndex < ROWS.length; rowIndex += 1) {
    const unit = ROWS[rowIndex]
    for (const digit of DIGITS) {
      const cells = candidateCells(state, unit, digit)
      if (cells.length === 1) {
        const targetCell = cells[0]
        const details = buildHiddenSingleDetails(
          'row',
          rowIndex,
          digit,
          targetCell,
          cells,
        )
        return {
          ...placeDigit(state, targetCell, digit),
          details,
        }
      }
    }
  }

  for (let columnIndex = 0; columnIndex < COLUMNS.length; columnIndex += 1) {
    const unit = COLUMNS[columnIndex]
    for (const digit of DIGITS) {
      const cells = candidateCells(state, unit, digit)
      if (cells.length === 1) {
        const targetCell = cells[0]
        const details = buildHiddenSingleDetails(
          'column',
          columnIndex,
          digit,
          targetCell,
          cells,
        )
        return {
          ...placeDigit(state, targetCell, digit),
          details,
        }
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
        const targetCell = cells[0]
        const details = buildCrossHatchDetails(
          getBox(targetCell),
          digit,
          targetCell,
          cells,
        )
        return {
          ...placeDigit(state, targetCell, digit),
          details,
        }
      }
    }
  }

  return resultFromCounts()
}
