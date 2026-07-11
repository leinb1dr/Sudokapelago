import { describe, expect, it } from 'vitest'
import { maskToDigits } from '../../src/sudoku/grid'
import {
  applyHiddenPairs,
  applyHiddenTriples,
  applyLockedCandidates,
  applyNakedPairs,
  applyNakedTriples,
  applyPointingPairsAndTriples,
} from '../../src/sudoku/techniques/medium'
import { candidateMask, createCandidateState } from './sudokuTestUtils'

describe('medium techniques', () => {
  it('eliminates a pointing pair or triple from the rest of a line', () => {
    const state = createCandidateState(candidateMask(1, 2, 3, 4))
    state.candidates[0] |= candidateMask(9)
    state.candidates[1] |= candidateMask(9)
    state.candidates[3] |= candidateMask(9)

    const result = applyPointingPairsAndTriples(state)

    expect(result.eliminations).toBe(1)
    expect(maskToDigits(state.candidates[3])).not.toContain(9)
  })

  it('claims locked candidates from a row into its box', () => {
    const state = createCandidateState(candidateMask(1, 2, 3, 4))
    state.candidates[0] |= candidateMask(9)
    state.candidates[1] |= candidateMask(9)
    state.candidates[9] |= candidateMask(9)

    const result = applyLockedCandidates(state)

    expect(result.eliminations).toBe(1)
    expect(maskToDigits(state.candidates[9])).not.toContain(9)
  })

  it('removes naked-pair digits from other cells in the unit', () => {
    const state = createCandidateState(candidateMask(3, 4, 5, 6))
    state.candidates[0] = candidateMask(1, 2)
    state.candidates[1] = candidateMask(1, 2)
    state.candidates[2] = candidateMask(1, 2, 3, 4)

    const result = applyNakedPairs(state)

    expect(result.eliminations).toBe(2)
    expect(maskToDigits(state.candidates[2])).toEqual([3, 4])
  })

  it('removes naked-triple digits from other cells in the unit', () => {
    const state = createCandidateState(candidateMask(4, 5, 6, 7))
    state.candidates[0] = candidateMask(1, 2)
    state.candidates[1] = candidateMask(1, 3)
    state.candidates[2] = candidateMask(2, 3)
    state.candidates[3] = candidateMask(1, 2, 3, 4)

    const result = applyNakedTriples(state)

    expect(result.eliminations).toBe(3)
    expect(maskToDigits(state.candidates[3])).toEqual([4])
  })

  it('restricts hidden pairs to their two digits', () => {
    const state = createCandidateState(candidateMask(3, 4, 5, 6))
    state.candidates[0] = candidateMask(1, 2, 3)
    state.candidates[1] = candidateMask(1, 2, 4)

    const result = applyHiddenPairs(state)

    expect(result.eliminations).toBe(2)
    expect(maskToDigits(state.candidates[0])).toEqual([1, 2])
    expect(maskToDigits(state.candidates[1])).toEqual([1, 2])
  })

  it('restricts hidden triples to their three digits', () => {
    const state = createCandidateState(candidateMask(4, 5, 6, 7))
    state.candidates[0] = candidateMask(1, 2, 4)
    state.candidates[1] = candidateMask(1, 3, 5)
    state.candidates[2] = candidateMask(2, 3, 6)

    const result = applyHiddenTriples(state)

    expect(result.eliminations).toBe(3)
    expect(maskToDigits(state.candidates[0])).toEqual([1, 2])
    expect(maskToDigits(state.candidates[1])).toEqual([1, 3])
    expect(maskToDigits(state.candidates[2])).toEqual([2, 3])
  })
})
