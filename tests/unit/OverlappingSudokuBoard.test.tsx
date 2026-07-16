import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import OverlappingSudokuBoard, {
  OVERLAP_CELL_PX,
} from '../../src/OverlappingSudokuBoard'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'
import {
  createEmptyGlobalBoard,
  mergeLocalSolution,
} from '../../src/sudoku/overlapping/globalBoard'
import { fillBoardWithOverlapConstraints } from '../../src/sudoku/overlapping/constrainedFill'
import { overlapFixedCellsForGrid } from '../../src/sudoku/overlapping/globalBoard'
import {
  generateSolvedBoard,
  createSeededRandom,
} from '../../src/sudoku/generator'

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
  it('renders one unified grid with logical board outlines', () => {
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

    const grid = screen.getByRole('grid', { name: 'Overlapping Sudoku grid' })
    expect(grid).toBeTruthy()
    // A single grid role — not one stacked SudokuGrid per topology node.
    expect(screen.getAllByRole('grid')).toHaveLength(1)

    const outlines = document.querySelectorAll('.overlapping-board__outline')
    expect(outlines).toHaveLength(2)

    const world = document.querySelector('.overlapping-board__unified-wrap')
    expect(world).toBeInstanceOf(HTMLElement)
    expect((world as HTMLElement).style.width).toBe(
      `${topology.bounds.width * OVERLAP_CELL_PX}px`,
    )
    expect((world as HTMLElement).style.height).toBe(
      `${topology.bounds.height * OVERLAP_CELL_PX}px`,
    )

    const inactive = document.querySelectorAll(
      '.overlapping-board__cell--inactive',
    )
    expect(inactive.length).toBeGreaterThan(0)

    const activeCells = grid.querySelectorAll('[role="gridcell"]')
    expect(activeCells.length).toBeGreaterThan(81)
    expect(activeCells.length).toBeLessThan(
      topology.bounds.width * topology.bounds.height,
    )

    expect(screen.getByRole('region', { name: 'Puzzle viewport' })).toBeTruthy()
    expect(document.querySelector('.puzzle-minimap')).not.toBeNull()
    expect(document.querySelector('canvas')).toBeNull()
    expect(document.querySelectorAll('.sudoku-grid')).toHaveLength(0)
  })

  it('renders five outlines on a 21×21 unified field for 5-grid 1-box', () => {
    const topology = buildSpiralTopology(1, 5)
    expect(topology.bounds.width).toBe(21)
    expect(topology.bounds.height).toBe(21)

    render(
      <OverlappingSudokuBoard
        board={createEmptyGlobalBoard()}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={createEmptyGlobalBoard()}
        onBoardChange={vi.fn()}
        pencilStyle="standard"
        topology={topology}
      />,
    )

    expect(
      screen.getByRole('grid', { name: 'Overlapping Sudoku grid' }),
    ).toBeTruthy()
    expect(document.querySelectorAll('.overlapping-board__outline')).toHaveLength(
      5,
    )
    expect(document.querySelectorAll('.overlapping-board__grid')).toHaveLength(0)
  })
})
