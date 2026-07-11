import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { createSudokuPuzzle } from '../../src/sudoku/setter'
import type { CellValue } from '../../src/sudoku/types'

vi.mock('archipelago.js', () => ({
  Client: class Client {},
}))

vi.mock('../../src/sudoku/setter', () => ({
  createSudokuPuzzle: vi.fn(),
}))

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })

  const puzzle = Array<CellValue>(81).fill(0)
  puzzle[0] = 5
  vi.mocked(createSudokuPuzzle).mockReturnValue({
    puzzle,
    solution: Array<CellValue>(81).fill(5),
    difficulty: 'expert',
    attempts: Array.from({ length: 81 }, (_, cell) => ({
      cell,
      digit: 5,
      accepted: cell !== 0,
      solveSteps: 1,
    })),
    clues: 1,
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('generates a puzzle with the selected human-technique ceiling', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('radio', { name: /Expert/ }))
    await user.click(
      screen.getByRole('button', { name: 'Generate expert puzzle' }),
    )

    expect(createSudokuPuzzle).toHaveBeenCalledWith({
      difficulty: 'expert',
    })
    expect((await screen.findByRole('status')).textContent).toContain(
      'expert puzzle · 1 clues · 81 cells tested',
    )
    expect(
      screen.getAllByRole('gridcell')[0].getAttribute('aria-readonly'),
    ).toBe('true')
  })
})
