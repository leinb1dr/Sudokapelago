import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UnifiedOverlappingGrid from '../../src/UnifiedOverlappingGrid'
import { OVERLAP_CELL_PX } from '../../src/OverlappingSudokuBoard'
import { createEmptyGlobalBoard } from '../../src/sudoku/overlapping/globalBoard'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'

afterEach(() => {
  cleanup()
})

describe('UnifiedOverlappingGrid', () => {
  it('navigates across holes with arrow keys', async () => {
    const user = userEvent.setup()
    const topology = buildSpiralTopology(1, 5)

    render(
      <UnifiedOverlappingGrid
        board={createEmptyGlobalBoard()}
        cellSizePx={OVERLAP_CELL_PX}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={createEmptyGlobalBoard()}
        onBoardChange={vi.fn()}
        onPencilMapChange={vi.fn()}
        pencilMap={new Map()}
        pencilStyle="standard"
        topology={topology}
      />,
    )

    // Normalized (8,0) is the right edge of the top-left board.
    const start = screen.getByRole('gridcell', {
      name: 'Empty cell row 1 column 9',
    })
    await user.click(start)
    await user.keyboard('{ArrowRight}')

    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Empty cell row 1 column 13',
    )
  })
})
