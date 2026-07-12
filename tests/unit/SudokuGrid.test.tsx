import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import SudokuGrid from '../../src/SudokuGrid'
import type { CellValue } from '../../src/sudoku/types'

afterEach(cleanup)

describe('SudokuGrid', () => {
  it('locks generated clues while allowing editable cells to change', async () => {
    const puzzle = Array<CellValue>(81).fill(0)
    puzzle[0] = 5
    const user = userEvent.setup()
    render(<SudokuGrid puzzle={puzzle} />)

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
    const { rerender } = render(<SudokuGrid puzzle={empty} />)

    await user.click(screen.getAllByRole('gridcell')[0])
    await user.keyboard('3')
    rerender(<SudokuGrid puzzle={next} />)

    const cells = screen.getAllByRole('gridcell')
    expect(cells[0].textContent).toBe('')
    expect(cells[1].textContent).toBe('7')
  })
})
