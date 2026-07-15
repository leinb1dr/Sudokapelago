import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { solveWithHumanTechniques } from '../../src/sudoku/humanSolver'
import { createSudokuPuzzle } from '../../src/sudoku/setter'
import type { CellValue } from '../../src/sudoku/types'

vi.mock('archipelago.js', () => ({
  Client: class Client {},
}))

vi.mock('../../src/sudoku/setter', () => ({
  createSudokuPuzzle: vi.fn(),
}))

vi.mock('../../src/sudoku/humanSolver', async () => {
  const actual = await vi.importActual('../../src/sudoku/humanSolver')
  return {
    ...actual,
    solveWithHumanTechniques: vi.fn(),
  }
})

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

  vi.mocked(solveWithHumanTechniques).mockReturnValue({
    solved: true,
    board: puzzle,
    reason: 'solved',
    steps: [
      {
        technique: 'naked-single',
        changed: true,
        placements: 1,
        eliminations: 0,
        details: {
          summary: 'Naked Single: r1 c2 set 4',
          reasoning: ['Only option left is 4.'],
          actions: [{ type: 'placement', cell: 1, digit: 4 }],
        },
      },
    ],
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

  it('runs the difficulty solver and logs detailed steps to the console', async () => {
    const user = userEvent.setup()
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Debug solve with easy techniques' }),
    )

    expect(solveWithHumanTechniques).toHaveBeenCalledWith(
      expect.any(Array),
      { difficulty: 'easy' },
    )
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Naked Single: r1 c2 set 4'),
    )

    groupSpy.mockRestore()
    logSpy.mockRestore()
    groupEndSpy.mockRestore()
  })

  it('toggles entry modes from Tab, Control, and held Shift', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      (screen.getByRole('radio', { name: 'Number' }) as HTMLInputElement)
        .checked,
    ).toBe(true)

    await user.keyboard('{Tab}')
    expect(
      (screen.getByRole('radio', { name: 'Pencil' }) as HTMLInputElement)
        .checked,
    ).toBe(true)
    expect(screen.getByText('Pencil mark style')).toBeTruthy()

    await user.keyboard('{Shift>}')
    expect(
      (
        screen.getByRole('radio', { name: 'Corner/Center' }) as HTMLInputElement
      ).checked,
    ).toBe(true)
    expect(screen.getByText('Corner or center')).toBeTruthy()
    expect(
      (screen.getByRole('radio', { name: 'Corner' }) as HTMLInputElement)
        .checked,
    ).toBe(true)

    await user.keyboard('{Control}')
    expect(
      (screen.getByRole('radio', { name: 'Center' }) as HTMLInputElement)
        .checked,
    ).toBe(true)

    await user.keyboard('{/Shift}')
    expect(
      (screen.getByRole('radio', { name: 'Standard' }) as HTMLInputElement)
        .checked,
    ).toBe(true)

    await user.keyboard('{Tab}')
    expect(
      (screen.getByRole('radio', { name: 'Number' }) as HTMLInputElement)
        .checked,
    ).toBe(true)
  })
})
