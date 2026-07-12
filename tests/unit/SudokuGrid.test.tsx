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
})
