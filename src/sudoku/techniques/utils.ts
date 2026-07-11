import { maskHasDigit } from '../grid'
import { eliminateCandidate } from '../solverState'
import type { Digit, SolverState, TechniqueResult } from '../types'

export function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size < 0 || size > items.length) {
    return []
  }
  if (size === 0) {
    return [[]]
  }

  const result: T[][] = []

  function choose(start: number, selected: T[]) {
    if (selected.length === size) {
      result.push([...selected])
      return
    }

    const remaining = size - selected.length
    for (let index = start; index <= items.length - remaining; index += 1) {
      selected.push(items[index])
      choose(index + 1, selected)
      selected.pop()
    }
  }

  choose(0, [])
  return result
}

export function candidateCells(
  state: SolverState,
  unit: readonly number[],
  digit: Digit,
): number[] {
  return unit.filter(
    (cell) =>
      state.board[cell] === 0 && maskHasDigit(state.candidates[cell], digit),
  )
}

export function eliminateFromCells(
  state: SolverState,
  cells: readonly number[],
  digit: Digit,
): TechniqueResult {
  let eliminations = 0

  for (const cell of cells) {
    eliminations += Number(eliminateCandidate(state, cell, digit))
  }

  return {
    changed: eliminations > 0,
    placements: 0,
    eliminations,
  }
}
