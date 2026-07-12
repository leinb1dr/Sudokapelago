import { describe, expect, it } from 'vitest'
import { isSolvedBoard } from '../../src/sudoku/grid'
import {
  createSeededRandom,
  generateSolvedBoard,
  shuffle,
} from '../../src/sudoku/generator'

describe('solved-board generation', () => {
  it('produces valid complete boards across deterministic seeds', () => {
    const boards = Array.from({ length: 20 }, (_, seed) =>
      generateSolvedBoard(createSeededRandom(seed)),
    )

    expect(boards.every(isSolvedBoard)).toBe(true)
    expect(new Set(boards.map((board) => board.join(''))).size).toBeGreaterThan(
      15,
    )
  })

  it('replays the same board for the same seed', () => {
    const first = generateSolvedBoard(createSeededRandom(42))
    const second = generateSolvedBoard(createSeededRandom(42))

    expect(first).toEqual(second)
  })

  it('shuffles without mutating the source array', () => {
    const source = [1, 2, 3, 4]
    const shuffled = shuffle(source, createSeededRandom(5))

    expect(shuffled).toEqual(expect.arrayContaining(source))
    expect(source).toEqual([1, 2, 3, 4])
  })
})
