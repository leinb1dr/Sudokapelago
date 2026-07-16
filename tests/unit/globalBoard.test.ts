import { describe, expect, it } from 'vitest'
import { generateSolvedBoard, createSeededRandom } from '../../src/sudoku/generator'
import {
  cloneGlobalBoard,
  countGlobalClues,
  createEmptyGlobalBoard,
  extractLocalBoard,
  getGlobalCell,
  listUniqueGlobalPoints,
  mergeLocalSolution,
  setGlobalCell,
  writeLocalBoard,
} from '../../src/sudoku/overlapping/globalBoard'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'

describe('global overlapping board', () => {
  it('round-trips local boards through the global coordinate map', () => {
    const topology = buildSpiralTopology(1, 2)
    const global = createEmptyGlobalBoard()
    const solved = generateSolvedBoard(createSeededRandom(8))

    mergeLocalSolution(global, topology.grids[0]!, solved)
    expect(extractLocalBoard(global, topology.grids[0]!)).toEqual(solved)
    expect(countGlobalClues(global)).toBe(81)

    const edited = [...solved]
    edited[40] = 0
    writeLocalBoard(global, topology.grids[0]!, edited)
    expect(getGlobalCell(global, { x: 4, y: 4 })).toBe(0)

    const copy = cloneGlobalBoard(global)
    setGlobalCell(copy, { x: 4, y: 4 }, 9)
    expect(getGlobalCell(global, { x: 4, y: 4 })).toBe(0)
    expect(listUniqueGlobalPoints(topology).length).toBe(81 + 81 - 9)
  })

  it('rejects conflicting merges on overlap cells', () => {
    const topology = buildSpiralTopology(1, 2)
    const global = createEmptyGlobalBoard()
    const solved = generateSolvedBoard(createSeededRandom(2))
    mergeLocalSolution(global, topology.grids[0]!, solved)

    const conflicting = Array.from({ length: 81 }, () => 9 as const)
    expect(() =>
      mergeLocalSolution(global, topology.grids[1]!, conflicting),
    ).toThrow(/conflict/i)
  })
})
