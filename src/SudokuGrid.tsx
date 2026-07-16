import './SudokuGrid.css'
import { useRef, useState } from 'react'
import SudokuCellContent from './SudokuCell'
import {
  BOX_SIZE,
  CELL_COUNT,
  GRID_SIZE,
  moveCellIndex,
} from './sudoku/grid'
import {
  clearVisiblePencilMarks,
  getCellAccessibleName,
  toggleDigitValue,
  togglePencilMark,
  updatePencilBoardCell,
  type CornerCenterMode,
  type EntryMode,
  type PencilBoard,
  type PencilStyle,
} from './sudoku/pencilMarks'
import type { Board, CellValue, Digit } from './sudoku/types'

const VALID_CELL_VALUE_PATTERN = /^[1-9]$/

const NAVIGATION_KEYS: Readonly<
  Record<string, { deltaRow: number; deltaColumn: number }>
> = {
  ArrowUp: { deltaRow: -1, deltaColumn: 0 },
  ArrowDown: { deltaRow: 1, deltaColumn: 0 },
  ArrowLeft: { deltaRow: 0, deltaColumn: -1 },
  ArrowRight: { deltaRow: 0, deltaColumn: 1 },
  w: { deltaRow: -1, deltaColumn: 0 },
  W: { deltaRow: -1, deltaColumn: 0 },
  s: { deltaRow: 1, deltaColumn: 0 },
  S: { deltaRow: 1, deltaColumn: 0 },
  a: { deltaRow: 0, deltaColumn: -1 },
  A: { deltaRow: 0, deltaColumn: -1 },
  d: { deltaRow: 0, deltaColumn: 1 },
  D: { deltaRow: 0, deltaColumn: 1 },
}

interface SudokuGridProps {
  board: Board
  givenCells?: readonly boolean[]
  pencilBoard: PencilBoard
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
  onBoardChange: (board: Board) => void
  onPencilBoardChange: (pencilBoard: PencilBoard) => void
  /** Optional accessible name; defaults to "Sudoku grid". */
  ariaLabel?: string
}

function getCellClassName(
  rowIndex: number,
  columnIndex: number,
  isSelected: boolean,
  isGiven: boolean,
) {
  const classes = ['sudoku-grid__cell']

  if (isSelected) {
    classes.push('sudoku-grid__cell--selected')
  }

  if (isGiven) {
    classes.push('sudoku-grid__cell--given')
  }

  if ((rowIndex + 1) % BOX_SIZE === 0 && rowIndex < GRID_SIZE - 1) {
    classes.push('sudoku-grid__cell--block-bottom')
  }

  if ((columnIndex + 1) % BOX_SIZE === 0 && columnIndex < GRID_SIZE - 1) {
    classes.push('sudoku-grid__cell--block-right')
  }

  if (rowIndex === GRID_SIZE - 1) {
    classes.push('sudoku-grid__cell--bottom-edge')
  }

  if (columnIndex === GRID_SIZE - 1) {
    classes.push('sudoku-grid__cell--right-edge')
  }

  return classes.join(' ')
}

function getGivenCells(puzzle?: Board): readonly boolean[] {
  return puzzle?.map((value) => value !== 0) ??
    Array<boolean>(CELL_COUNT).fill(false)
}

function SudokuGrid({
  board,
  givenCells,
  pencilBoard,
  entryMode,
  pencilStyle,
  cornerCenterMode,
  onBoardChange,
  onPencilBoardChange,
  ariaLabel = 'Sudoku grid',
}: SudokuGridProps) {
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
  const lockedCells = givenCells ?? getGivenCells()

  function selectCell(cellIndex: number) {
    setSelectedCellIndex(cellIndex)
    cellRefs.current[cellIndex]?.focus()
  }

  function navigateFromCell(
    event: React.KeyboardEvent<HTMLDivElement>,
    cellIndex: number,
  ) {
    const navigation = NAVIGATION_KEYS[event.key]
    if (!navigation) {
      return
    }

    event.preventDefault()
    const currentIndex = selectedCellIndex ?? cellIndex
    const nextIndex = moveCellIndex(
      currentIndex,
      navigation.deltaRow,
      navigation.deltaColumn,
    )
    selectCell(nextIndex)
  }

  function updateCellValue(cellIndex: number, value: CellValue) {
    if (lockedCells[cellIndex]) {
      return
    }

    onBoardChange(
      board.map((currentValue, currentIndex) =>
        currentIndex === cellIndex ? value : currentValue,
      ),
    )
  }

  function handleDigitInput(cellIndex: number, digit: Digit) {
    if (lockedCells[cellIndex]) {
      return
    }

    if (entryMode === 'digit') {
      updateCellValue(cellIndex, toggleDigitValue(board[cellIndex], digit))
      return
    }

    if (board[cellIndex] !== 0) {
      return
    }

    const nextMarks = togglePencilMark(
      pencilBoard[cellIndex],
      digit,
      pencilStyle,
      cornerCenterMode,
    )
    onPencilBoardChange(
      updatePencilBoardCell(pencilBoard, cellIndex, nextMarks),
    )
  }

  function handleClearInput(cellIndex: number) {
    if (lockedCells[cellIndex]) {
      return
    }

    if (board[cellIndex] !== 0) {
      updateCellValue(cellIndex, 0)
      return
    }

    if (entryMode === 'pencil') {
      onPencilBoardChange(
        updatePencilBoardCell(
          pencilBoard,
          cellIndex,
          clearVisiblePencilMarks(
            pencilBoard[cellIndex],
            pencilStyle,
            cornerCenterMode,
          ),
        ),
      )
    }
  }

  return (
    <div className="sudoku-grid" role="grid" aria-label={ariaLabel}>
      {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
        <div className="sudoku-grid__row" role="row" key={rowIndex}>
          {Array.from({ length: GRID_SIZE }).map((_, columnIndex) => {
            const cellIndex = rowIndex * GRID_SIZE + columnIndex
            const cellValue = board[cellIndex]
            const cellMarks = pencilBoard[cellIndex]
            const cellDescription = `row ${rowIndex + 1} column ${columnIndex + 1}`
            const isSelected = selectedCellIndex === cellIndex
            const isGiven = lockedCells[cellIndex]

            return (
              <div
                ref={(element) => {
                  cellRefs.current[cellIndex] = element
                }}
                aria-label={getCellAccessibleName({
                  value: cellValue,
                  marks: cellMarks,
                  pencilStyle,
                  isGiven,
                  cellDescription,
                })}
                aria-readonly={isGiven}
                aria-selected={isSelected}
                className={getCellClassName(
                  rowIndex,
                  columnIndex,
                  isSelected,
                  isGiven,
                )}
                key={`${rowIndex}-${columnIndex}`}
                onClick={() => {
                  selectCell(cellIndex)
                }}
                onFocus={() => {
                  setSelectedCellIndex(cellIndex)
                }}
                onKeyDown={(event) => {
                  if (NAVIGATION_KEYS[event.key]) {
                    navigateFromCell(event, cellIndex)
                    return
                  }

                  if (VALID_CELL_VALUE_PATTERN.test(event.key)) {
                    handleDigitInput(
                      selectedCellIndex ?? cellIndex,
                      Number(event.key) as Digit,
                    )
                  } else if (
                    event.key === 'Backspace' ||
                    event.key === 'Delete'
                  ) {
                    handleClearInput(selectedCellIndex ?? cellIndex)
                  }
                }}
                role="gridcell"
                tabIndex={selectedCellIndex === cellIndex ? 0 : -1}
              >
                <SudokuCellContent
                  marks={cellMarks}
                  pencilStyle={pencilStyle}
                  value={cellValue}
                />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default SudokuGrid
