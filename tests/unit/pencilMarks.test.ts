import { describe, expect, it } from 'vitest'
import {
  clearVisiblePencilMarks,
  createEmptyCellMarks,
  createEmptyPencilBoard,
  describePencilMarks,
  getCellAccessibleName,
  hasVisiblePencilMarks,
  toggleCenterMark,
  toggleCornerMark,
  toggleDigitValue,
  togglePencilMark,
  toggleStandardMark,
  updatePencilBoardCell,
} from '../../src/sudoku/pencilMarks'

describe('pencilMarks', () => {
  it('creates an empty pencil board for every cell', () => {
    const board = createEmptyPencilBoard()

    expect(board).toHaveLength(81)
    expect(board[0]).toEqual(createEmptyCellMarks())
    expect(board[80]).toEqual(createEmptyCellMarks())
  })

  it('toggles standard marks independently by digit position', () => {
    let marks = createEmptyCellMarks()

    marks = toggleStandardMark(marks, 1)
    marks = toggleStandardMark(marks, 9)
    expect(marks.standard).toEqual([1, 9])

    marks = toggleStandardMark(marks, 1)
    expect(marks.standard).toEqual([9])
  })

  it('keeps corner marks sorted and capped at four digits', () => {
    let marks = createEmptyCellMarks()

    marks = toggleCornerMark(marks, 1)
    marks = toggleCornerMark(marks, 5)
    marks = toggleCornerMark(marks, 3)
    expect(marks.corner).toEqual([1, 3, 5])

    marks = toggleCornerMark(marks, 1)
    expect(marks.corner).toEqual([3, 5])

    marks = toggleCornerMark(marks, 2)
    marks = toggleCornerMark(marks, 4)
    marks = toggleCornerMark(marks, 6)
    expect(marks.corner).toEqual([2, 3, 4, 5])

    const unchanged = toggleCornerMark(marks, 9)
    expect(unchanged).toBe(marks)
    expect(unchanged.corner).toEqual([2, 3, 4, 5])
  })

  it('toggles center marks into sorted numeric order', () => {
    let marks = createEmptyCellMarks()

    marks = toggleCenterMark(marks, 1)
    marks = toggleCenterMark(marks, 3)
    marks = toggleCenterMark(marks, 9)
    marks = toggleCenterMark(marks, 5)
    expect(marks.center).toEqual([1, 3, 5, 9])

    marks = toggleCenterMark(marks, 3)
    expect(marks.center).toEqual([1, 5, 9])
  })

  it('keeps corner and center marks independent', () => {
    let marks = createEmptyCellMarks()

    marks = toggleCenterMark(marks, 1)
    marks = toggleCornerMark(marks, 1)

    expect(marks.center).toEqual([1])
    expect(marks.corner).toEqual([1])
  })

  it('routes toggles through the active pencil style and sub-mode', () => {
    let marks = createEmptyCellMarks()

    marks = togglePencilMark(marks, 2, 'standard', 'corner')
    expect(marks.standard).toEqual([2])

    marks = togglePencilMark(marks, 4, 'corner-center', 'corner')
    expect(marks.corner).toEqual([4])

    marks = togglePencilMark(marks, 7, 'corner-center', 'center')
    expect(marks.center).toEqual([7])
  })

  it('clears only the currently editable pencil mark set', () => {
    const marks = {
      standard: [1, 2] as const,
      corner: [3, 4] as const,
      center: [5, 6] as const,
    }

    expect(clearVisiblePencilMarks(marks, 'standard', 'corner')).toEqual({
      standard: [],
      corner: [3, 4],
      center: [5, 6],
    })
    expect(clearVisiblePencilMarks(marks, 'corner-center', 'corner')).toEqual({
      standard: [1, 2],
      corner: [],
      center: [5, 6],
    })
    expect(clearVisiblePencilMarks(marks, 'corner-center', 'center')).toEqual({
      standard: [1, 2],
      corner: [3, 4],
      center: [],
    })
  })

  it('updates a single cell on the pencil board', () => {
    const board = createEmptyPencilBoard()
    const next = updatePencilBoardCell(
      board,
      3,
      toggleStandardMark(board[3], 8),
    )

    expect(next[3].standard).toEqual([8])
    expect(next[2]).toEqual(board[2])
  })

  it('toggles digits on and off while preserving replacement behavior', () => {
    expect(toggleDigitValue(0, 5)).toBe(5)
    expect(toggleDigitValue(5, 5)).toBe(0)
    expect(toggleDigitValue(5, 7)).toBe(7)
  })

  it('describes visible pencil marks for the active style', () => {
    const marks = {
      standard: [1, 9] as const,
      corner: [2, 4] as const,
      center: [3, 5] as const,
    }

    expect(hasVisiblePencilMarks(marks, 'standard')).toBe(true)
    expect(describePencilMarks(marks, 'standard')).toBe(
      'standard pencil marks 1 9',
    )
    expect(describePencilMarks(marks, 'corner-center')).toBe(
      'corner pencil marks 2 4, center pencil marks 3 5',
    )
    expect(describePencilMarks(createEmptyCellMarks(), 'standard')).toBe('')
    expect(
      getCellAccessibleName({
        value: 0,
        marks,
        pencilStyle: 'corner-center',
        isGiven: false,
        cellDescription: 'row 1 column 2',
      }),
    ).toBe(
      'Empty cell row 1 column 2 with corner pencil marks 2 4, center pencil marks 3 5',
    )
  })
})
