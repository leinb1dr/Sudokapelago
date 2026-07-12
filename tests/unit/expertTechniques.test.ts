import { describe, expect, it } from 'vitest'
import { maskToDigits } from '../../src/sudoku/grid'
import { applySwordfish } from '../../src/sudoku/techniques/expert'
import { candidateMask, createCandidateState } from './sudokuTestUtils'

describe('expert techniques', () => {
  it('eliminates a Swordfish digit from all three cover lines', () => {
    const state = createCandidateState(candidateMask(1, 2, 3, 4))
    for (const cell of [1, 4, 31, 34, 55, 61, 10, 22, 79]) {
      state.candidates[cell] |= candidateMask(9)
    }

    const result = applySwordfish(state)

    expect(result.eliminations).toBe(3)
    expect(maskToDigits(state.candidates[10])).not.toContain(9)
    expect(maskToDigits(state.candidates[22])).not.toContain(9)
    expect(maskToDigits(state.candidates[79])).not.toContain(9)
  })
})
