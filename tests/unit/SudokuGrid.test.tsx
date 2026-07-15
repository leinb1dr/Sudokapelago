import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import SudokuGrid from '../../src/SudokuGrid'
import {
  createEmptyPencilBoard,
  type CornerCenterMode,
  type EntryMode,
  type PencilBoard,
  type PencilStyle,
} from '../../src/sudoku/pencilMarks'
import type { Board, CellValue } from '../../src/sudoku/types'

afterEach(cleanup)

function ControlledSudokuGrid({
  puzzle,
  entryMode = 'digit',
  pencilStyle = 'standard',
  cornerCenterMode = 'corner',
}: {
  puzzle: Board
  entryMode?: EntryMode
  pencilStyle?: PencilStyle
  cornerCenterMode?: CornerCenterMode
}) {
  const [board, setBoard] = useState<Board>(() => [...puzzle])
  const [pencilBoard, setPencilBoard] = useState<PencilBoard>(() =>
    createEmptyPencilBoard(),
  )

  useEffect(() => {
    setBoard([...puzzle])
    setPencilBoard(createEmptyPencilBoard())
  }, [puzzle])

  return (
    <SudokuGrid
      board={board}
      cornerCenterMode={cornerCenterMode}
      entryMode={entryMode}
      givenCells={puzzle.map((value) => value !== 0)}
      onBoardChange={setBoard}
      onPencilBoardChange={setPencilBoard}
      pencilBoard={pencilBoard}
      pencilStyle={pencilStyle}
    />
  )
}

describe('SudokuGrid', () => {
  it('locks generated clues while allowing editable cells to change', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    puzzle[0] = 5
    const user = userEvent.setup()
    render(<ControlledSudokuGrid puzzle={puzzle} />)

    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(81)
    expect(cells[0].getAttribute('aria-readonly')).toBe('true')
    expect(cells[1].getAttribute('aria-readonly')).toBe('false')

    await user.click(cells[0])
    await user.keyboard('9')
    expect(cells[0].textContent).toBe('5')

    await user.click(cells[1])
    await user.keyboard('4')
    expect(cells[1].textContent).toBe('4')
    await user.keyboard('{Backspace}')
    expect(cells[1].textContent).toBe('')
  })

  it('resets player entries when a new puzzle is supplied', async () => {
    const empty = Array<CellValue>(81).fill(0)
    const next = [...empty]
    next[1] = 7
    const user = userEvent.setup()
    const { rerender } = render(<ControlledSudokuGrid puzzle={empty} />)

    await user.click(screen.getAllByRole('gridcell')[0])
    await user.keyboard('3')
    rerender(<ControlledSudokuGrid puzzle={next} />)

    const cells = screen.getAllByRole('gridcell')
    expect(cells[0].textContent).toBe('')
    expect(cells[1].textContent).toBe('7')
  })

  it('moves selection with arrow keys and clamps at grid edges', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    render(<ControlledSudokuGrid puzzle={puzzle} />)

    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[0])
    expect(cells[0].getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(cells[1])
    expect(cells[1].getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(cells[10])
    expect(cells[10].getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(cells[9])

    await user.click(cells[0])
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(cells[0])
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(cells[0])
  })

  it('moves selection with WASD keys', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    render(<ControlledSudokuGrid puzzle={puzzle} />)

    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[40])
    await user.keyboard('d')
    expect(document.activeElement).toBe(cells[41])
    expect(cells[41].getAttribute('aria-selected')).toBe('true')

    await user.keyboard('s')
    expect(document.activeElement).toBe(cells[50])

    await user.keyboard('a')
    expect(document.activeElement).toBe(cells[49])

    await user.keyboard('w')
    expect(document.activeElement).toBe(cells[40])
  })

  it('enters values in the cell reached by keyboard navigation', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    render(<ControlledSudokuGrid puzzle={puzzle} />)

    const cells = screen.getAllByRole('gridcell')

    await user.click(cells[0])
    await user.keyboard('{ArrowRight}7')
    expect(cells[1].textContent).toBe('7')
  })

  it('toggles standard pencil marks in fixed digit positions', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    render(
      <ControlledSudokuGrid entryMode="pencil" pencilStyle="standard" puzzle={puzzle} />,
    )

    const cell = screen.getAllByRole('gridcell')[0]
    await user.click(cell)
    await user.keyboard('19')

    expect(cell.querySelector('[data-digit="1"]')?.textContent).toBe('1')
    expect(cell.querySelector('[data-digit="9"]')?.textContent).toBe('9')
    expect(cell.getAttribute('aria-label')).toContain('standard pencil marks 1 9')

    await user.keyboard('1')
    expect(cell.querySelector('[data-digit="1"]')?.textContent).toBe('')
    expect(cell.querySelector('[data-digit="9"]')?.textContent).toBe('9')
  })

  it('places sorted corner marks and coexists with center marks', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    const { rerender } = render(
      <ControlledSudokuGrid
        cornerCenterMode="corner"
        entryMode="pencil"
        pencilStyle="corner-center"
        puzzle={puzzle}
      />,
    )

    const cell = screen.getAllByRole('gridcell')[0]
    await user.click(cell)
    await user.keyboard('153')

    expect(cell.querySelector('[data-corner-slot="top-left"]')?.textContent).toBe(
      '1',
    )
    expect(cell.querySelector('[data-corner-slot="top-right"]')?.textContent).toBe(
      '3',
    )
    expect(
      cell.querySelector('[data-corner-slot="bottom-left"]')?.textContent,
    ).toBe('5')

    rerender(
      <ControlledSudokuGrid
        cornerCenterMode="center"
        entryMode="pencil"
        pencilStyle="corner-center"
        puzzle={puzzle}
      />,
    )

    await user.click(cell)
    await user.keyboard('29')
    expect(cell.querySelector('.sudoku-grid__center-marks')?.textContent).toBe(
      '2 9',
    )
    expect(cell.querySelector('[data-corner-slot="top-left"]')?.textContent).toBe(
      '1',
    )
  })

  it('preserves independent pencil styles when switching', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    const { rerender } = render(
      <ControlledSudokuGrid entryMode="pencil" pencilStyle="standard" puzzle={puzzle} />,
    )

    const cell = screen.getAllByRole('gridcell')[0]
    await user.click(cell)
    await user.keyboard('1')

    rerender(
      <ControlledSudokuGrid
        cornerCenterMode="corner"
        entryMode="pencil"
        pencilStyle="corner-center"
        puzzle={puzzle}
      />,
    )

    expect(cell.querySelector('[data-digit="1"]')).toBeNull()
    expect(cell.querySelector('[data-corner-slot="top-left"]')).toBeNull()

    await user.click(cell)
    await user.keyboard('2')
    expect(cell.querySelector('[data-corner-slot="top-left"]')?.textContent).toBe(
      '2',
    )

    rerender(
      <ControlledSudokuGrid entryMode="pencil" pencilStyle="standard" puzzle={puzzle} />,
    )
    expect(cell.querySelector('[data-digit="1"]')?.textContent).toBe('1')
  })

  it('hides pencil marks under a digit and restores them when toggled off', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    const user = userEvent.setup()
    const { rerender } = render(
      <ControlledSudokuGrid entryMode="pencil" pencilStyle="standard" puzzle={puzzle} />,
    )

    const cell = screen.getAllByRole('gridcell')[0]
    await user.click(cell)
    await user.keyboard('15')

    rerender(<ControlledSudokuGrid entryMode="digit" puzzle={puzzle} />)
    await user.click(cell)
    await user.keyboard('8')
    expect(cell.textContent).toBe('8')
    expect(cell.querySelector('[data-digit="1"]')).toBeNull()

    await user.keyboard('8')
    expect(cell.querySelector('[data-digit="1"]')?.textContent).toBe('1')
    expect(cell.querySelector('[data-digit="5"]')?.textContent).toBe('5')
  })
})
