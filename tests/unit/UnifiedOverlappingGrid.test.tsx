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
    const onCellSelected = vi.fn()

    render(
      <UnifiedOverlappingGrid
        board={createEmptyGlobalBoard()}
        cellSizePx={OVERLAP_CELL_PX}
        cornerCenterMode="corner"
        entryMode="digit"
        givenBoard={createEmptyGlobalBoard()}
        onBoardChange={vi.fn()}
        onCellSelected={onCellSelected}
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
    expect(onCellSelected).toHaveBeenCalled()
    const firstSelection = onCellSelected.mock.calls.at(-1)!
    expect(firstSelection).toHaveLength(2)

    await user.keyboard('{ArrowRight}')

    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Empty cell row 1 column 13',
    )
    expect(onCellSelected.mock.calls.length).toBeGreaterThan(1)
    expect(onCellSelected).toHaveBeenLastCalledWith(
      expect.any(Number),
      firstSelection[1],
    )
    const secondSelection = onCellSelected.mock.calls.at(-1)!
    expect(secondSelection[0]).toBeGreaterThan(firstSelection[0] as number)
  })

  it('focuses cells without scrolling the page', async () => {
    const user = userEvent.setup()
    const topology = buildSpiralTopology(1, 2)
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')

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

    const cell = screen.getAllByRole('gridcell')[0]!
    await user.click(cell)

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
    focusSpy.mockRestore()
  })
})
