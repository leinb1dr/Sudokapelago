import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import SudokuGrid from '../../src/SudokuGrid'
import type { Board, CellValue } from '../../src/sudoku/types'

afterEach(cleanup)

function ControlledSudokuGrid({ puzzle }: { puzzle: Board }) {
  const [board, setBoard] = useState<Board>(() => [...puzzle])

  useEffect(() => {
    setBoard([...puzzle])
  }, [puzzle])

  return (
    <SudokuGrid
      board={board}
      givenCells={puzzle.map((value) => value !== 0)}
      onBoardChange={setBoard}
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
})
