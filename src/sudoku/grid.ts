import type { Board, CandidateMask, CellValue, Digit } from './types'

export const GRID_SIZE = 9
export const BOX_SIZE = 3
export const CELL_COUNT = GRID_SIZE * GRID_SIZE
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly Digit[]
export const FULL_CANDIDATE_MASK = DIGITS.reduce(
  (mask, digit) => mask | digitToMask(digit),
  0,
)

function createRows(): readonly (readonly number[])[] {
  return Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (__, column) => row * GRID_SIZE + column),
  )
}

function createColumns(): readonly (readonly number[])[] {
  return Array.from({ length: GRID_SIZE }, (_, column) =>
    Array.from({ length: GRID_SIZE }, (__, row) => row * GRID_SIZE + column),
  )
}

function createBoxes(): readonly (readonly number[])[] {
  return Array.from({ length: GRID_SIZE }, (_, box) => {
    const firstRow = Math.floor(box / BOX_SIZE) * BOX_SIZE
    const firstColumn = (box % BOX_SIZE) * BOX_SIZE

    return Array.from({ length: GRID_SIZE }, (__, offset) => {
      const row = firstRow + Math.floor(offset / BOX_SIZE)
      const column = firstColumn + (offset % BOX_SIZE)
      return row * GRID_SIZE + column
    })
  })
}

export const ROWS = createRows()
export const COLUMNS = createColumns()
export const BOXES = createBoxes()
export const ALL_UNITS = [...ROWS, ...COLUMNS, ...BOXES] as const

export const PEERS: readonly (readonly number[])[] = Array.from(
  { length: CELL_COUNT },
  (_, cell) => {
    const row = getRow(cell)
    const column = getColumn(cell)
    const box = getBox(cell)
    return [
      ...new Set([...ROWS[row], ...COLUMNS[column], ...BOXES[box]]),
    ].filter((peer) => peer !== cell)
  },
)

export function getRow(cell: number): number {
  return Math.floor(cell / GRID_SIZE)
}

export function getColumn(cell: number): number {
  return cell % GRID_SIZE
}

export function getBox(cell: number): number {
  return (
    Math.floor(getRow(cell) / BOX_SIZE) * BOX_SIZE +
    Math.floor(getColumn(cell) / BOX_SIZE)
  )
}

export function digitToMask(digit: Digit): CandidateMask {
  return 1 << digit
}

export function maskHasDigit(mask: CandidateMask, digit: Digit): boolean {
  return (mask & digitToMask(digit)) !== 0
}

export function countCandidates(mask: CandidateMask): number {
  let remaining = mask
  let count = 0

  while (remaining !== 0) {
    remaining &= remaining - 1
    count += 1
  }

  return count
}

export function maskToDigits(mask: CandidateMask): Digit[] {
  return DIGITS.filter((digit) => maskHasDigit(mask, digit))
}

export function singleDigitFromMask(mask: CandidateMask): Digit | null {
  return countCandidates(mask) === 1 ? (maskToDigits(mask)[0] ?? null) : null
}

export function isValidBoard(board: Board): boolean {
  if (
    board.length !== CELL_COUNT ||
    board.some((value) => !Number.isInteger(value) || value < 0 || value > 9)
  ) {
    return false
  }

  return ALL_UNITS.every((unit) => {
    const seen = new Set<CellValue>()

    for (const cell of unit) {
      const value = board[cell]
      if (value !== 0 && seen.has(value)) {
        return false
      }
      if (value !== 0) {
        seen.add(value)
      }
    }

    return true
  })
}

export function isSolvedBoard(board: Board): boolean {
  return isValidBoard(board) && board.every((value) => value !== 0)
}

export function getCandidateMask(board: Board, cell: number): CandidateMask {
  if (board[cell] !== 0) {
    return 0
  }

  let mask = FULL_CANDIDATE_MASK
  for (const peer of PEERS[cell]) {
    const value = board[peer]
    if (value !== 0) {
      mask &= ~digitToMask(value)
    }
  }
  return mask
}

export function boardsEqual(left: Board, right: Board): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

export function countClues(board: Board): number {
  return board.reduce((count, value) => count + Number(value !== 0), 0)
}

export function boardFromString(serialized: string): CellValue[] {
  if (!/^[0-9.]{81}$/.test(serialized)) {
    throw new Error('A Sudoku board must contain exactly 81 digits or periods.')
  }

  return Array.from(serialized, (character) =>
    character === '.' ? 0 : (Number(character) as CellValue),
  )
}

export function boardToString(board: Board): string {
  if (board.length !== CELL_COUNT) {
    throw new Error('A Sudoku board must contain exactly 81 cells.')
  }

  return board.map((value) => (value === 0 ? '.' : String(value))).join('')
}
