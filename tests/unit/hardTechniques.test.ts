import { describe, expect, it } from 'vitest'
import { maskToDigits } from '../../src/sudoku/grid'
import {
  applyXWing,
  applyYWing,
} from '../../src/sudoku/techniques/hard'
import { candidateMask, createCandidateState } from './sudokuTestUtils'

describe('hard techniques', () => {
  it('eliminates an X-Wing digit from matching cover columns', () => {
    const state = createCandidateState(candidateMask(1, 2, 3, 4))
    for (const cell of [1, 7, 28, 34, 46, 79]) {
      state.candidates[cell] |= candidateMask(9)
    }

    const result = applyXWing(state)

    expect(result.eliminations).toBe(2)
    expect(maskToDigits(state.candidates[46])).not.toContain(9)
    expect(maskToDigits(state.candidates[79])).not.toContain(9)
  })

  it('eliminates the shared pincer candidate with a Y-Wing', () => {
    const state = createCandidateState(candidateMask(4, 5, 6, 7))
    state.candidates[0] = candidateMask(1, 2)
    state.candidates[4] = candidateMask(1, 3)
    state.candidates[36] = candidateMask(2, 3)
    state.candidates[40] = candidateMask(3, 4)

    const result = applyYWing(state)

    expect(result.eliminations).toBe(1)
    expect(maskToDigits(state.candidates[40])).toEqual([4])
  })
})
