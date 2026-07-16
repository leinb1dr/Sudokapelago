import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OverlappingUnifiedGrid from '../../src/OverlappingUnifiedGrid'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'
import {
  createEmptyGlobalBoard,
  setGlobalCell,
} from '../../src/sudoku/overlapping/globalBoard'

afterEach(() => {
  cleanup()
})

describe('OverlappingUnifiedGrid', () => {
  it('edits a shared cell once on the global board', async () => {
    const user = userEvent.setup()
    const topology = buildSpiralTopology(1, 2)
    const board = createEmptyGlobalBoard()
    const givenBoard = createEmptyGlobalBoard()
    const onBoardChange = vi.fn()

    // Seed one given so the board is non-empty visually.
    const origin = topology.grids[0]!.origin
    setGlobalCell(givenBoard, origin, 5)
    setGlobalCell(board, origin, 5)

    render(
      <OverlappingUnifiedGrid
        board={board}
        cellPx={36}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={givenBoard}
        onBoardChange={onBoardChange}
        pencilStyle="standard"
        topology={topology}
      />,
    )

    const editable = screen
      .getByRole('grid', { name: 'Overlapping Sudoku grid' })
      .querySelector('[role="gridcell"][aria-readonly="false"]')
    expect(editable).toBeTruthy()

    await user.click(editable!)
    await user.keyboard('7')

    expect(onBoardChange).toHaveBeenCalled()
    const next = onBoardChange.mock.calls.at(-1)?.[0] as Map<string, number>
    const values = [...next.values()].filter((value) => value === 7)
    expect(values).toHaveLength(1)
  })
})
