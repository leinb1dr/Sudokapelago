import './SudokuGrid.css'
import { useState } from 'react'
import { BOX_SIZE, CELL_COUNT, GRID_SIZE } from './sudoku/grid'
import type { Board, CellValue } from './sudoku/types'

const VALID_CELL_VALUE_PATTERN = /^[1-9]$/

interface SudokuGridProps {
  board: Board
  givenCells?: readonly boolean[]
  onBoardChange: (board: Board) => void
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

function SudokuGrid({ board, givenCells, onBoardChange }: SudokuGridProps) {
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null)
  const lockedCells = givenCells ?? getGivenCells()

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

  return (
    <div className="sudoku-grid" role="grid" aria-label="Sudoku grid">
      {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
        <div className="sudoku-grid__row" role="row" key={rowIndex}>
          {Array.from({ length: GRID_SIZE }).map((_, columnIndex) => {
            const cellIndex = rowIndex * GRID_SIZE + columnIndex
            const cellValue = board[cellIndex]
            const cellDescription = `row ${rowIndex + 1} column ${columnIndex + 1}`
            const isSelected = selectedCellIndex === cellIndex
            const isGiven = lockedCells[cellIndex]

            return (
              <div
                aria-label={
                  cellValue
                    ? `${isGiven ? 'Given cell' : 'Cell'} ${cellDescription} value ${cellValue}`
                    : `Empty cell ${cellDescription}`
                }
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
                  setSelectedCellIndex(cellIndex)
                }}
                onFocus={() => {
                  setSelectedCellIndex(cellIndex)
                }}
                onKeyDown={(event) => {
                  if (VALID_CELL_VALUE_PATTERN.test(event.key)) {
                    updateCellValue(
                      selectedCellIndex ?? cellIndex,
                      Number(event.key) as CellValue,
                    )
                  } else if (
                    event.key === 'Backspace' ||
                    event.key === 'Delete'
                  ) {
                    updateCellValue(selectedCellIndex ?? cellIndex, 0)
                  }
                }}
                role="gridcell"
                tabIndex={0}
              >
                {cellValue || ''}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default SudokuGrid
