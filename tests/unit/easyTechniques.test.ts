import { describe, expect, it } from 'vitest'
import {
  applyCrossHatching,
  applyHiddenSingles,
  applyNakedSingles,
} from '../../src/sudoku/techniques/easy'
import { candidateMask, createCandidateState } from './sudokuTestUtils'

describe('easy techniques', () => {
  it('places a naked single', () => {
    const state = createCandidateState(candidateMask(1, 2))
    state.candidates[0] = candidateMask(5)

    const result = applyNakedSingles(state)

    expect(result.placements).toBe(1)
    expect(state.board[0]).toBe(5)
  })

  it('places a hidden single in a row or column', () => {
    const state = createCandidateState(candidateMask(1, 2))
    state.candidates[4] = candidateMask(1, 2, 3)

    const result = applyHiddenSingles(state)

    expect(result.placements).toBe(1)
    expect(state.board[4]).toBe(3)
  })

  it('cross-hatches boxes independently from row and column singles', () => {
    const state = createCandidateState(candidateMask(1, 2))
    state.candidates[10] = candidateMask(1, 2, 4)

    const result = applyCrossHatching(state)

    expect(result.placements).toBe(1)
    expect(state.board[10]).toBe(4)
  })
})
