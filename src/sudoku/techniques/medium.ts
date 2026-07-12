import {
  ALL_UNITS,
  BOXES,
  COLUMNS,
  DIGITS,
  ROWS,
  countCandidates,
  getBox,
  getColumn,
  getRow,
  maskToDigits,
} from '../grid'
import { eliminateCandidate, resultFromCounts } from '../solverState'
import type {
  CandidateMask,
  Digit,
  SolverState,
  TechniqueResult,
} from '../types'
import {
  candidateCells,
  combinations,
  eliminateFromCells,
} from './utils'

export function applyPointingPairsAndTriples(
  state: SolverState,
): TechniqueResult {
  for (let boxIndex = 0; boxIndex < BOXES.length; boxIndex += 1) {
    const box = BOXES[boxIndex]

    for (const digit of DIGITS) {
      const cells = candidateCells(state, box, digit)
      if (cells.length < 2 || cells.length > 3) {
        continue
      }

      const rows = new Set(cells.map(getRow))
      if (rows.size === 1) {
        const row = getRow(cells[0])
        const result = eliminateFromCells(
          state,
          ROWS[row].filter((cell) => getBox(cell) !== boxIndex),
          digit,
        )
        if (result.changed) {
          return result
        }
      }

      const columns = new Set(cells.map(getColumn))
      if (columns.size === 1) {
        const column = getColumn(cells[0])
        const result = eliminateFromCells(
          state,
          COLUMNS[column].filter((cell) => getBox(cell) !== boxIndex),
          digit,
        )
        if (result.changed) {
          return result
        }
      }
    }
  }

  return resultFromCounts()
}

export function applyLockedCandidates(state: SolverState): TechniqueResult {
  for (const unit of [...ROWS, ...COLUMNS]) {
    for (const digit of DIGITS) {
      const cells = candidateCells(state, unit, digit)
      if (cells.length < 2 || cells.length > 3) {
        continue
      }

      const boxes = new Set(cells.map(getBox))
      if (boxes.size !== 1) {
        continue
      }

      const box = getBox(cells[0])
      const unitCells = new Set(unit)
      const result = eliminateFromCells(
        state,
        BOXES[box].filter((cell) => !unitCells.has(cell)),
        digit,
      )
      if (result.changed) {
        return result
      }
    }
  }

  return resultFromCounts()
}

function applyNakedSubset(
  state: SolverState,
  size: 2 | 3,
): TechniqueResult {
  for (const unit of ALL_UNITS) {
    const eligibleCells = unit.filter((cell) => {
      const count = countCandidates(state.candidates[cell])
      return state.board[cell] === 0 && count >= 2 && count <= size
    })

    for (const cells of combinations(eligibleCells, size)) {
      const unionMask = cells.reduce(
        (mask, cell) => mask | state.candidates[cell],
        0,
      )
      if (countCandidates(unionMask) !== size) {
        continue
      }

      const selected = new Set(cells)
      let eliminations = 0
      for (const cell of unit) {
        if (selected.has(cell) || state.board[cell] !== 0) {
          continue
        }
        for (const digit of maskToDigits(unionMask)) {
          eliminations += Number(eliminateCandidate(state, cell, digit))
        }
      }

      if (eliminations > 0) {
        return resultFromCounts(0, eliminations)
      }
    }
  }

  return resultFromCounts()
}

function applyHiddenSubset(
  state: SolverState,
  size: 2 | 3,
): TechniqueResult {
  for (const unit of ALL_UNITS) {
    for (const digits of combinations<Digit>(DIGITS, size)) {
      const positions = digits.map((digit) => candidateCells(state, unit, digit))
      if (
        positions.some(
          (cells) => cells.length < 2 || cells.length > size,
        )
      ) {
        continue
      }

      const cells = [...new Set(positions.flat())]
      if (cells.length !== size) {
        continue
      }

      const hiddenMask = digits.reduce<CandidateMask>(
        (mask, digit) => mask | (1 << digit),
        0,
      )
      let eliminations = 0

      for (const cell of cells) {
        const extraDigits = maskToDigits(
          state.candidates[cell] & ~hiddenMask,
        )
        for (const digit of extraDigits) {
          eliminations += Number(eliminateCandidate(state, cell, digit))
        }
      }

      if (eliminations > 0) {
        return resultFromCounts(0, eliminations)
      }
    }
  }

  return resultFromCounts()
}

export function applyNakedPairs(state: SolverState): TechniqueResult {
  return applyNakedSubset(state, 2)
}

export function applyNakedTriples(state: SolverState): TechniqueResult {
  return applyNakedSubset(state, 3)
}

export function applyHiddenPairs(state: SolverState): TechniqueResult {
  return applyHiddenSubset(state, 2)
}

export function applyHiddenTriples(state: SolverState): TechniqueResult {
  return applyHiddenSubset(state, 3)
}
