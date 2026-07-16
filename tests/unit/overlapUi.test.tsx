import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PuzzleViewport from '../../src/PuzzleViewport'
import PuzzleMinimap from '../../src/PuzzleMinimap'
import OverlappingSudokuBoard from '../../src/OverlappingSudokuBoard'
import TopologyPicker from '../../src/TopologyPicker'
import {
  createEmptyGlobalBoard,
  createGraphFromTopology,
  writeLocalBoard,
} from '../../src/sudoku/overlap'
import { createEmptyPencilBoard } from '../../src/sudoku/pencilMarks'
import { generateSolvedBoard, createSeededRandom } from '../../src/sudoku/generator'

describe('TopologyPicker', () => {
  it('lets the player choose an overlapping layout', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TopologyPicker value="single" onChange={onChange} />)

    await user.click(
      screen.getByRole('radio', { name: /2 grids · 1-box overlap/i }),
    )
    expect(onChange).toHaveBeenCalledWith('two-grids-1-overlap')
  })
})

describe('PuzzleViewport', () => {
  it('exposes zoom controls and reports viewport changes', async () => {
    const user = userEvent.setup()
    const onViewportChange = vi.fn()
    render(
      <PuzzleViewport
        contentHeight={400}
        contentWidth={400}
        onViewportChange={onViewportChange}
      >
        <div>content</div>
      </PuzzleViewport>,
    )

    expect(screen.getByRole('region', { name: 'Puzzle viewport' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(onViewportChange).toHaveBeenCalled()
  })
})

describe('PuzzleMinimap', () => {
  it('renders a silhouette for each grid in the topology', () => {
    const graph = createGraphFromTopology('two-grids-1-overlap')
    const { container } = render(
      <PuzzleMinimap graph={graph} viewport={null} />,
    )
    expect(screen.getByRole('img', { name: 'Puzzle minimap' })).toBeTruthy()
    expect(container.querySelectorAll('.puzzle-minimap__grid')).toHaveLength(2)
  })
})

describe('OverlappingSudokuBoard', () => {
  it('renders unique global cells and accepts digit input', async () => {
    const user = userEvent.setup()
    const graph = createGraphFromTopology('two-grids-1-overlap')
    const board = createEmptyGlobalBoard(graph)
    const solved = generateSolvedBoard(createSeededRandom(7))
    writeLocalBoard(board, graph, 'grid-0', solved)
    // Clear playable cells except givens for a sparse play board.
    const playBoard = board.map((value) => (value === null ? null : 0))
    const givenBoard = [...board]
    const onBoardChange = vi.fn()

    render(
      <OverlappingSudokuBoard
        board={playBoard}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={givenBoard.map((value) =>
          value === null ? null : 0,
        )}
        graph={graph}
        onBoardChange={onBoardChange}
        onPencilBoardChange={vi.fn()}
        pencilBoard={createEmptyPencilBoard(playBoard.length)}
        pencilStyle="standard"
      />,
    )

    const grid = screen.getByRole('grid', { name: 'Overlapping Sudoku board' })
    const cells = grid.querySelectorAll('[role="gridcell"]')
    // two grids 1-box corner overlap = 81*2 - 9 = 153 cells
    expect(cells.length).toBe(153)

    await user.click(cells[0])
    await user.keyboard('5')
    expect(onBoardChange).toHaveBeenCalled()
  })
})
