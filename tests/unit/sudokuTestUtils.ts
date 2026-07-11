import {
  CELL_COUNT,
  FULL_CANDIDATE_MASK,
  digitToMask,
} from '../../src/sudoku/grid'
import type {
  CandidateMask,
  Digit,
  SolverState,
} from '../../src/sudoku/types'

export function candidateMask(...digits: Digit[]): CandidateMask {
  return digits.reduce((mask, digit) => mask | digitToMask(digit), 0)
}

export function createCandidateState(
  candidates: CandidateMask = FULL_CANDIDATE_MASK,
): SolverState {
  return {
    board: Array(CELL_COUNT).fill(0),
    candidates: Array(CELL_COUNT).fill(candidates),
    contradiction: false,
  }
}
