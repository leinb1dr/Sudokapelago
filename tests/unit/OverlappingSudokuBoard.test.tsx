import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import OverlappingSudokuBoard from '../../src/OverlappingSudokuBoard'
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
import { getUniqueGlobalCellCount } from '../../src/sudoku/overlapping/topology'

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
  it('renders one unified DOM grid with logical board outlines', () => {
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

    expect(
      screen.getByRole('grid', { name: 'Overlapping Sudoku grid' }),
    ).toBeTruthy()
    expect(screen.queryByRole('grid', { name: 'Sudoku grid 1' })).toBeNull()
    expect(screen.queryByRole('grid', { name: 'Sudoku grid 2' })).toBeNull()
    expect(document.querySelectorAll('.sudoku-grid').length).toBe(0)
    expect(document.querySelectorAll('.overlapping-board__grid').length).toBe(0)
    expect(
      document.querySelectorAll('.unified-grid__board-outline').length,
    ).toBe(topology.grids.length)
    expect(screen.getByRole('region', { name: 'Puzzle viewport' })).toBeTruthy()
    expect(document.querySelector('.puzzle-minimap')).not.toBeNull()
    expect(document.querySelector('canvas')).toBeNull()

    const occupiedCount = document.querySelectorAll(
      '.unified-grid__cell--occupied',
    ).length
    expect(occupiedCount).toBe(getUniqueGlobalCellCount(topology))

    const emptyCount = document.querySelectorAll(
      '.unified-grid__cell--empty',
    ).length
    expect(emptyCount).toBe(
      topology.bounds.width * topology.bounds.height - occupiedCount,
    )
  })

  it('edits a cell once in the shared global board', async () => {
    const user = userEvent.setup()
    const topology = buildSpiralTopology(1, 2)
    const board = createEmptyGlobalBoard()
    const onBoardChange = vi.fn()

    render(
      <OverlappingSudokuBoard
        board={board}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={createEmptyGlobalBoard()}
        onBoardChange={onBoardChange}
        pencilStyle="standard"
        topology={topology}
      />,
    )

    const cell = screen.getAllByRole('gridcell')[0]!
    await user.click(cell)
    await user.keyboard('5')

    expect(onBoardChange).toHaveBeenCalledTimes(1)
    const nextBoard = onBoardChange.mock.calls[0]![0] as Map<string, number>
    expect([...nextBoard.values()]).toEqual([5])
  })

  it('pans the puzzle viewport when keyboard nav reaches a cell outside view', async () => {
    const user = userEvent.setup()
    const topology = buildSpiralTopology(1, 5)
    const board = createEmptyGlobalBoard()

    render(
      <OverlappingSudokuBoard
        board={board}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={createEmptyGlobalBoard()}
        onBoardChange={vi.fn()}
        pencilStyle="standard"
        topology={topology}
      />,
    )

    const world = document.querySelector('.puzzle-viewport__world') as HTMLElement
    expect(world).not.toBeNull()

    // Zoom in so only a fraction of the large board fits.
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))

    const transformBefore = world.style.transform

    // Top-left cell is visible at default pan; walk far right off the edge.
    const start = screen.getByRole('gridcell', {
      name: 'Empty cell row 1 column 1',
    })
    await user.click(start)

    for (let i = 0; i < 20; i += 1) {
      await user.keyboard('{ArrowRight}')
    }

    const transformAfter = world.style.transform
    expect(transformAfter).not.toBe(transformBefore)
    expect(transformAfter).toMatch(/translate\(/)
    // Panning right moves the world left (negative translateX contribution).
    expect(transformAfter).not.toEqual(transformBefore)
  })
})
