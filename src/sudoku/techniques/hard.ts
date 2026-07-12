import {
  CELL_COUNT,
  COLUMNS,
  DIGITS,
  PEERS,
  ROWS,
  countCandidates,
  getColumn,
  getRow,
  maskToDigits,
} from '../grid'
import { eliminateCandidate, resultFromCounts } from '../solverState'
import type { Digit, SolverState, TechniqueResult } from '../types'
import { candidateCells, combinations } from './utils'

interface FishLine {
  index: number
  covers: number[]
}

function findXWing(
  state: SolverState,
  digit: Digit,
  orientation: 'rows' | 'columns',
): TechniqueResult {
  const baseUnits = orientation === 'rows' ? ROWS : COLUMNS
  const coverIndex = orientation === 'rows' ? getColumn : getRow
  const lines: FishLine[] = baseUnits.flatMap((unit, index) => {
    const cells = candidateCells(state, unit, digit)
    return cells.length === 2
      ? [{ index, covers: cells.map(coverIndex).sort((a, b) => a - b) }]
      : []
  })

  for (const [first, second] of combinations(lines, 2)) {
    if (
      first.covers[0] !== second.covers[0] ||
      first.covers[1] !== second.covers[1]
    ) {
      continue
    }

    let eliminations = 0
    for (let baseIndex = 0; baseIndex < 9; baseIndex += 1) {
      if (baseIndex === first.index || baseIndex === second.index) {
        continue
      }

      for (const cover of first.covers) {
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

export function applyXWing(state: SolverState): TechniqueResult {
  for (const digit of DIGITS) {
    const rowResult = findXWing(state, digit, 'rows')
    if (rowResult.changed) {
      return rowResult
    }

    const columnResult = findXWing(state, digit, 'columns')
    if (columnResult.changed) {
      return columnResult
    }
  }

  return resultFromCounts()
}

export function applyYWing(state: SolverState): TechniqueResult {
  const bivalueCells = Array.from({ length: CELL_COUNT }, (_, cell) => cell).filter(
    (cell) =>
      state.board[cell] === 0 &&
      countCandidates(state.candidates[cell]) === 2,
  )
  const bivalueSet = new Set(bivalueCells)

  for (const pivot of bivalueCells) {
    const pivotMask = state.candidates[pivot]
    const wings = PEERS[pivot].filter((cell) => bivalueSet.has(cell))

    for (const [firstWing, secondWing] of combinations(wings, 2)) {
      const firstMask = state.candidates[firstWing]
      const secondMask = state.candidates[secondWing]
      const firstShared = firstMask & pivotMask
      const secondShared = secondMask & pivotMask
      const firstOutside = firstMask & ~pivotMask
      const secondOutside = secondMask & ~pivotMask

      if (
        countCandidates(firstShared) !== 1 ||
        countCandidates(secondShared) !== 1 ||
        firstShared === secondShared ||
        countCandidates(firstOutside) !== 1 ||
        firstOutside !== secondOutside
      ) {
        continue
      }

      const targetDigit = maskToDigits(firstOutside)[0]
      if (targetDigit === undefined) {
        continue
      }

      const secondWingPeers = new Set(PEERS[secondWing])
      let eliminations = 0
      for (const cell of PEERS[firstWing]) {
        if (
          cell !== pivot &&
          cell !== firstWing &&
          cell !== secondWing &&
          secondWingPeers.has(cell)
        ) {
          eliminations += Number(
            eliminateCandidate(state, cell, targetDigit),
          )
        }
      }

      if (eliminations > 0) {
        return resultFromCounts(0, eliminations)
      }
    }
  }

  return resultFromCounts()
}
