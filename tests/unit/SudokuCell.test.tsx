import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SudokuCellContent from '../../src/SudokuCell'
import {
  createEmptyCellMarks,
  getCellAccessibleName,
} from '../../src/sudoku/pencilMarks'

afterEach(cleanup)

describe('SudokuCellContent', () => {
  it('renders a placed digit instead of pencil marks', () => {
    render(
      <SudokuCellContent
        marks={{ standard: [1], corner: [2], center: [3] }}
        pencilStyle="standard"
        value={7}
      />,
    )

    expect(screen.getByText('7')).toBeTruthy()
    expect(screen.queryByText('1')).toBeNull()
  })

  it('renders standard marks in a fixed 3x3 layout', () => {
    const { container } = render(
      <SudokuCellContent
        marks={{ ...createEmptyCellMarks(), standard: [1, 5, 9] }}
        pencilStyle="standard"
        value={0}
      />,
    )

    expect(
      container.querySelector('[data-digit="1"]')?.textContent,
    ).toBe('1')
    expect(
      container.querySelector('[data-digit="5"]')?.textContent,
    ).toBe('5')
    expect(
      container.querySelector('[data-digit="9"]')?.textContent,
    ).toBe('9')
    expect(
      container.querySelector('[data-digit="2"]')?.textContent,
    ).toBe('')
  })

  it('renders sorted corner and center marks together', () => {
    const { container } = render(
      <SudokuCellContent
        marks={{
          standard: [],
          corner: [1, 3, 5],
          center: [2, 4, 6],
        }}
        pencilStyle="corner-center"
        value={0}
      />,
    )

    expect(
      container.querySelector('[data-corner-slot="top-left"]')?.textContent,
    ).toBe('1')
    expect(
      container.querySelector('[data-corner-slot="top-right"]')?.textContent,
    ).toBe('3')
    expect(
      container.querySelector('[data-corner-slot="bottom-left"]')?.textContent,
    ).toBe('5')
    expect(container.querySelector('.sudoku-grid__center-marks')?.textContent).toBe(
      '2 4 6',
    )
  })
})

describe('getCellAccessibleName', () => {
  it('builds accessible names for digits and pencil marks', () => {
    expect(
      getCellAccessibleName({
        value: 4,
        marks: createEmptyCellMarks(),
        pencilStyle: 'standard',
        isGiven: true,
        cellDescription: 'row 1 column 1',
      }),
    ).toBe('Given cell row 1 column 1 value 4')

    expect(
      getCellAccessibleName({
        value: 0,
        marks: { ...createEmptyCellMarks(), standard: [1, 9] },
        pencilStyle: 'standard',
        isGiven: false,
        cellDescription: 'row 2 column 3',
      }),
    ).toBe('Empty cell row 2 column 3 with standard pencil marks 1 9')
  })
})
