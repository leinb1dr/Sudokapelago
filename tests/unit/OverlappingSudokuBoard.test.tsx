import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import OverlappingSudokuBoard from '../../src/OverlappingSudokuBoard'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'
import {
  createEmptyGlobalBoard,
  mergeLocalSolution,
} from '../../src/sudoku/overlapping/globalBoard'
import { fillBoardWithOverlapConstraints } from '../../src/sudoku/overlapping/constrainedFill'
import { overlapFixedCellsForGrid } from '../../src/sudoku/overlapping/globalBoard'
import { generateSolvedBoard, createSeededRandom } from '../../src/sudoku/generator'

beforeEach(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('OverlappingSudokuBoard', () => {
  it('renders one DOM grid per topology node plus a minimap', () => {
    const topology = buildSpiralTopology(1, 2)
    const board = createEmptyGlobalBoard()
    const center = generateSolvedBoard(createSeededRandom(3))
    mergeLocalSolution(board, topology.grids[0]!, center)

    const fixed = overlapFixedCellsForGrid(topology, topology.grids[1]!, board)
    const filled = fillBoardWithOverlapConstraints(fixed, createSeededRandom(4))
    expect(filled.ok).toBe(true)
    mergeLocalSolution(board, topology.grids[1]!, filled.board!)

    const given = new Map(board)

    render(
      <OverlappingSudokuBoard
        board={board}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={given}
        onBoardChange={vi.fn()}
        pencilStyle="standard"
        topology={topology}
      />,
    )

    expect(screen.getByRole('grid', { name: 'Sudoku grid 1' })).toBeTruthy()
    expect(screen.getByRole('grid', { name: 'Sudoku grid 2' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Puzzle viewport' })).toBeTruthy()
    expect(document.querySelector('.puzzle-minimap')).not.toBeNull()
    expect(document.querySelector('canvas')).toBeNull()
  })
})
