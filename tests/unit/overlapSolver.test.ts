import { describe, expect, it } from 'vitest'
import { boardFromString } from '../../src/sudoku/grid'
import {
  solveWithOverlapValidation,
  tryRemoveClueWithOverlapGuard,
} from '../../src/sudoku/overlapping/overlapSolver'
import type { Digit } from '../../src/sudoku/types'

const SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179'

describe('overlap-validated solving', () => {
  it('accepts a normal human solve when overlap digits agree', () => {
    const puzzle = boardFromString(SOLUTION)
    puzzle[1] = 0
    const known = new Map<number, Digit>([[0, 5]])
    const result = solveWithOverlapValidation(puzzle, known, {
      difficulty: 'easy',
    })
    expect(result.solved).toBe(true)
    expect(result.board[0]).toBe(5)
  })

  it('rejects boards whose givens already conflict with the overlap oracle', () => {
    const puzzle = boardFromString(SOLUTION)
    const known = new Map<number, Digit>([[0, 9]])
    const result = solveWithOverlapValidation(puzzle, known, {
      difficulty: 'easy',
    })
    expect(result.solved).toBe(false)
    expect(result.reason).toBe('invalid')
  })

  it('restores clues when overlap-aware verification fails', () => {
    const puzzle = boardFromString(SOLUTION)
    const known = new Map<number, Digit>()
    const attempt = tryRemoveClueWithOverlapGuard(
      puzzle,
      boardFromString(SOLUTION),
      0,
      known,
      { difficulty: 'easy', techniques: [] },
    )
    expect(attempt.accepted).toBe(false)
    expect(puzzle[0]).toBe(5)
  })
})
