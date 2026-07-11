import './SudokuGrid.css'
import { useEffect, useState } from 'react'
import { BOX_SIZE, CELL_COUNT, GRID_SIZE } from './sudoku/grid'
import type { Board, CellValue } from './sudoku/types'

const VALID_CELL_VALUE_PATTERN = /^[1-9]$/

interface SudokuGridProps {
  puzzle?: Board
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

function getInitialValues(puzzle?: Board): CellValue[] {
  return puzzle ? [...puzzle] : Array<CellValue>(CELL_COUNT).fill(0)
}

function SudokuGrid({ puzzle }: SudokuGridProps) {
  const [cellValues, setCellValues] = useState(() => getInitialValues(puzzle))
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null)
  const givenCells = puzzle?.map((value) => value !== 0) ??
    Array<boolean>(CELL_COUNT).fill(false)

  useEffect(() => {
    setCellValues(getInitialValues(puzzle))
    setSelectedCellIndex(null)
  }, [puzzle])

  function updateCellValue(cellIndex: number, value: CellValue) {
    if (givenCells[cellIndex]) {
      return
    }

    setCellValues((currentCellValues) =>
      currentCellValues.map((currentValue, currentIndex) =>
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
            const cellValue = cellValues[cellIndex]
            const cellDescription = `row ${rowIndex + 1} column ${columnIndex + 1}`
            const isSelected = selectedCellIndex === cellIndex
            const isGiven = givenCells[cellIndex]

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
