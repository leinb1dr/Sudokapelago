import {
  COLUMNS,
  DIGITS,
  ROWS,
  getColumn,
  getRow,
} from '../grid'
import { eliminateCandidate, resultFromCounts } from '../solverState'
import type { Digit, SolverState, TechniqueResult } from '../types'
import { candidateCells, combinations } from './utils'

interface SwordfishLine {
  index: number
  covers: number[]
}

function findSwordfish(
  state: SolverState,
  digit: Digit,
  orientation: 'rows' | 'columns',
): TechniqueResult {
  const baseUnits = orientation === 'rows' ? ROWS : COLUMNS
  const coverIndex = orientation === 'rows' ? getColumn : getRow
  const lines: SwordfishLine[] = baseUnits.flatMap((unit, index) => {
    const cells = candidateCells(state, unit, digit)
    return cells.length >= 2 && cells.length <= 3
      ? [{ index, covers: cells.map(coverIndex) }]
      : []
  })

  for (const selectedLines of combinations(lines, 3)) {
    const covers = [...new Set(selectedLines.flatMap((line) => line.covers))]
    if (covers.length !== 3) {
      continue
    }

    const allCoversParticipateTwice = covers.every(
      (cover) =>
        selectedLines.filter((line) => line.covers.includes(cover)).length >= 2,
    )
    if (!allCoversParticipateTwice) {
      continue
    }

    const selectedIndexes = new Set(selectedLines.map((line) => line.index))
    let eliminations = 0
    for (let baseIndex = 0; baseIndex < 9; baseIndex += 1) {
      if (selectedIndexes.has(baseIndex)) {
        continue
      }

      for (const cover of covers) {
        const cell =
          orientation === 'rows'
            ? baseIndex * 9 + cover
            : cover * 9 + baseIndex
        eliminations += Number(eliminateCandidate(state, cell, digit))
      }
    }

    if (eliminations > 0) {
      return resultFromCounts(0, eliminations)
    }
  }

  return resultFromCounts()
}

export function applySwordfish(state: SolverState): TechniqueResult {
  for (const digit of DIGITS) {
    const rowResult = findSwordfish(state, digit, 'rows')
    if (rowResult.changed) {
      return rowResult
    }

    const columnResult = findSwordfish(state, digit, 'columns')
    if (columnResult.changed) {
      return columnResult
    }
  }

  return resultFromCounts()
}
