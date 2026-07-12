import { describe, expect, it } from 'vitest'
import { ROWS, maskHasDigit } from '../../src/sudoku/grid'
import {
  candidateCells,
  combinations,
  eliminateFromCells,
} from '../../src/sudoku/techniques/utils'
import { candidateMask, createCandidateState } from './sudokuTestUtils'

describe('technique utilities', () => {
  it('enumerates combinations without mutating input', () => {
    const values = [1, 2, 3]
    expect(combinations(values, 2)).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ])
    expect(values).toEqual([1, 2, 3])
    expect(combinations(values, 4)).toEqual([])
  })

  it('finds and removes candidates in selected cells', () => {
    const state = createCandidateState(candidateMask(1, 2))
    state.candidates[2] = candidateMask(2)

    expect(candidateCells(state, ROWS[0], 1)).not.toContain(2)
    const result = eliminateFromCells(state, [0, 1], 1)

    expect(result.eliminations).toBe(2)
    expect(maskHasDigit(state.candidates[0], 1)).toBe(false)
  })
})
