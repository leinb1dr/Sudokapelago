import { describe, expect, it } from 'vitest'
import {
  ALL_UNITS,
  BOXES,
  COLUMNS,
  PEERS,
  ROWS,
  boardFromString,
  boardToString,
  countCandidates,
  countClues,
  getCandidateMask,
  isSolvedBoard,
  isValidBoard,
  maskToDigits,
} from '../../src/sudoku/grid'

const SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179'

describe('Sudoku grid primitives', () => {
  it('builds the 27 units and 20 unique peers per cell', () => {
    expect(ROWS).toHaveLength(9)
    expect(COLUMNS).toHaveLength(9)
    expect(BOXES).toHaveLength(9)
    expect(ALL_UNITS).toHaveLength(27)
    expect(PEERS.every((peers) => peers.length === 20)).toBe(true)
  })

  it('validates complete, partial, malformed, and duplicate boards', () => {
    const solved = boardFromString(SOLUTION)
    const partial = [...solved]
    partial[0] = 0
    const duplicate = [...solved]
    duplicate[0] = duplicate[1]

    expect(isSolvedBoard(solved)).toBe(true)
    expect(isValidBoard(partial)).toBe(true)
    expect(isSolvedBoard(partial)).toBe(false)
    expect(isValidBoard(duplicate)).toBe(false)
    expect(isValidBoard([1, 2, 3])).toBe(false)
  })

  it('derives candidates and serializes empty cells as periods', () => {
    const board = boardFromString(SOLUTION)
    board[0] = 0
    const candidates = getCandidateMask(board, 0)

    expect(countCandidates(candidates)).toBe(1)
    expect(maskToDigits(candidates)).toEqual([5])
    expect(countClues(board)).toBe(80)
    expect(boardToString(board)).toBe(`.${SOLUTION.slice(1)}`)
  })

  it('rejects malformed serialized boards', () => {
    expect(() => boardFromString('123')).toThrow(/81/)
    expect(() => boardToString([0])).toThrow(/81/)
  })
})
