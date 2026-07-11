import { describe, expect, it } from 'vitest'
import { boardFromString } from '../../src/sudoku/grid'
import {
  cloneSolverState,
  createSolverState,
  eliminateCandidate,
  placeDigit,
  solverStateIsSolved,
} from '../../src/sudoku/solverState'

const SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179'

describe('solver state', () => {
  it('initializes candidates and propagates a valid placement', () => {
    const board = boardFromString(`.${SOLUTION.slice(1)}`)
    const state = createSolverState(board)

    const result = placeDigit(state, 0, 5)

    expect(result.placements).toBe(1)
    expect(solverStateIsSolved(state)).toBe(true)
  })

  it('marks the state contradictory when its final candidate is removed', () => {
    const board = boardFromString(`.${SOLUTION.slice(1)}`)
    const state = createSolverState(board)

    expect(eliminateCandidate(state, 0, 5)).toBe(true)
    expect(state.contradiction).toBe(true)
  })

  it('rejects duplicate givens and clones state without shared arrays', () => {
    const duplicate = boardFromString(SOLUTION)
    duplicate[0] = duplicate[1]
    const invalid = createSolverState(duplicate)
    expect(invalid.contradiction).toBe(true)

    const original = createSolverState(boardFromString(SOLUTION))
    const clone = cloneSolverState(original)
    clone.board[0] = 0
    expect(original.board[0]).toBe(5)
  })
})
