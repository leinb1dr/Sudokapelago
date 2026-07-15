import { CELL_COUNT } from './grid'
import type { CellValue, Digit } from './types'

export const ENTRY_MODES = ['digit', 'pencil'] as const
export type EntryMode = (typeof ENTRY_MODES)[number]

export const PENCIL_STYLES = ['standard', 'corner-center'] as const
export type PencilStyle = (typeof PENCIL_STYLES)[number]

export const CORNER_CENTER_MODES = ['corner', 'center'] as const
export type CornerCenterMode = (typeof CORNER_CENTER_MODES)[number]

export function toggleEntryMode(mode: EntryMode): EntryMode {
  return mode === 'digit' ? 'pencil' : 'digit'
}

export function togglePencilStyle(style: PencilStyle): PencilStyle {
  return style === 'standard' ? 'corner-center' : 'standard'
}

export function toggleCornerCenterMode(
  mode: CornerCenterMode,
): CornerCenterMode {
  return mode === 'corner' ? 'center' : 'corner'
}

export const CORNER_MARK_LIMIT = 4
export const STANDARD_DIGITS: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export type CornerSlot = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export const CORNER_SLOTS: readonly CornerSlot[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

export interface CellMarks {
  standard: readonly Digit[]
  corner: readonly Digit[]
  center: readonly Digit[]
}

export type PencilBoard = readonly CellMarks[]

export function createEmptyCellMarks(): CellMarks {
  return {
    standard: [],
    corner: [],
    center: [],
  }
}

export function createEmptyPencilBoard(): PencilBoard {
  return Array.from({ length: CELL_COUNT }, () => createEmptyCellMarks())
}

function insertSorted(digits: readonly Digit[], digit: Digit): readonly Digit[] {
  const next = [...digits, digit]
  next.sort((left, right) => left - right)
  return next
}

function toggleInSorted(digits: readonly Digit[], digit: Digit): readonly Digit[] {
  if (digits.includes(digit)) {
    return digits.filter((current) => current !== digit)
  }

  return insertSorted(digits, digit)
}

export function toggleStandardMark(marks: CellMarks, digit: Digit): CellMarks {
  return {
    ...marks,
    standard: toggleInSorted(marks.standard, digit),
  }
}

export function toggleCornerMark(marks: CellMarks, digit: Digit): CellMarks {
  if (marks.corner.includes(digit)) {
    return {
      ...marks,
      corner: marks.corner.filter((current) => current !== digit),
    }
  }

  if (marks.corner.length >= CORNER_MARK_LIMIT) {
    return marks
  }

  return {
    ...marks,
    corner: insertSorted(marks.corner, digit),
  }
}

export function toggleCenterMark(marks: CellMarks, digit: Digit): CellMarks {
  return {
    ...marks,
    center: toggleInSorted(marks.center, digit),
  }
}

export function togglePencilMark(
  marks: CellMarks,
  digit: Digit,
  style: PencilStyle,
  cornerCenterMode: CornerCenterMode,
): CellMarks {
  if (style === 'standard') {
    return toggleStandardMark(marks, digit)
  }

  if (cornerCenterMode === 'corner') {
    return toggleCornerMark(marks, digit)
  }

  return toggleCenterMark(marks, digit)
}

export function clearVisiblePencilMarks(
  marks: CellMarks,
  style: PencilStyle,
  cornerCenterMode: CornerCenterMode,
): CellMarks {
  if (style === 'standard') {
    return {
      ...marks,
      standard: [],
    }
  }

  if (cornerCenterMode === 'corner') {
    return {
      ...marks,
      corner: [],
    }
  }

  return {
    ...marks,
    center: [],
  }
}

export function updatePencilBoardCell(
  board: PencilBoard,
  cellIndex: number,
  nextMarks: CellMarks,
): PencilBoard {
  return board.map((marks, index) => (index === cellIndex ? nextMarks : marks))
}

export function toggleDigitValue(current: CellValue, digit: Digit): CellValue {
  return current === digit ? 0 : digit
}

export function hasVisiblePencilMarks(
  marks: CellMarks,
  style: PencilStyle,
): boolean {
  if (style === 'standard') {
    return marks.standard.length > 0
  }

  return marks.corner.length > 0 || marks.center.length > 0
}

export function describePencilMarks(
  marks: CellMarks,
  style: PencilStyle,
): string {
  if (style === 'standard') {
    if (marks.standard.length === 0) {
      return ''
    }

    return `standard pencil marks ${marks.standard.join(' ')}`
  }

  const parts: string[] = []

  if (marks.corner.length > 0) {
    parts.push(`corner pencil marks ${marks.corner.join(' ')}`)
  }

  if (marks.center.length > 0) {
    parts.push(`center pencil marks ${marks.center.join(' ')}`)
  }

  return parts.join(', ')
}

export function getCellAccessibleName(options: {
  value: CellValue
  marks: CellMarks
  pencilStyle: PencilStyle
  isGiven: boolean
  cellDescription: string
}): string {
  const { value, marks, pencilStyle, isGiven, cellDescription } = options

  if (value) {
    return `${isGiven ? 'Given cell' : 'Cell'} ${cellDescription} value ${value}`
  }

  const markDescription = describePencilMarks(marks, pencilStyle)
  if (markDescription) {
    return `Empty cell ${cellDescription} with ${markDescription}`
  }

  return `Empty cell ${cellDescription}`
}
