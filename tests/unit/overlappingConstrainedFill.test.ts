import { describe, expect, it } from 'vitest'
import { isSolvedBoard, isValidBoard } from '../../src/sudoku/grid'
import { createSeededRandom, generateSolvedBoard } from '../../src/sudoku/generator'
import {
  boardRespectsOverlapSolution,
  fillBoardWithOverlapConstraints,
  isPlacementValidForOverlap,
} from '../../src/sudoku/overlapping/constrainedFill'
import type { Digit } from '../../src/sudoku/types'

describe('constrained overlap fill', () => {
  it('rejects placements that conflict with known overlap digits', () => {
    const known = new Map<number, Digit>([[0, 5]])
    expect(isPlacementValidForOverlap(0, 5, known)).toBe(true)
    expect(isPlacementValidForOverlap(0, 7, known)).toBe(false)
    expect(isPlacementValidForOverlap(1, 7, known)).toBe(true)
  })

  it('fills a board that preserves fixed overlap solution cells', () => {
    const solution = generateSolvedBoard(createSeededRandom(11))
    const fixedCells = [0, 1, 2, 9, 10, 11, 18, 19, 20].map((cell) => ({
      cell,
      digit: solution[cell] as Digit,
    }))

    const result = fillBoardWithOverlapConstraints(
      fixedCells,
      createSeededRandom(99),
    )

    expect(result.ok).toBe(true)
    expect(result.board).not.toBeNull()
    expect(isSolvedBoard(result.board!)).toBe(true)
    expect(isValidBoard(result.board!)).toBe(true)
    for (const { cell, digit } of fixedCells) {
      expect(result.board![cell]).toBe(digit)
    }
  })

  it('fails when fixed overlap cells already conflict', () => {
    const result = fillBoardWithOverlapConstraints(
      [
        { cell: 0, digit: 1 },
        { cell: 1, digit: 1 },
      ],
      createSeededRandom(1),
    )
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('overlap-conflict')
  })

  it('detects boards that drift from the overlap oracle', () => {
    const board = Array.from({ length: 81 }, () => 0)
    board[0] = 4
    const known = new Map<number, Digit>([[0, 5]])
    expect(boardRespectsOverlapSolution(board, known)).toBe(false)
    board[0] = 5
    expect(boardRespectsOverlapSolution(board, known)).toBe(true)
  })
})
