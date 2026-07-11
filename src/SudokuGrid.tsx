import './SudokuGrid.css'
import { useState } from 'react'

const GRID_SIZE = 9
const BLOCK_SIZE = 3
const CELL_COUNT = GRID_SIZE * GRID_SIZE
const VALID_CELL_VALUE_PATTERN = /^[1-9]$/

function getCellClassName(rowIndex: number, columnIndex: number, isSelected: boolean) {
  const classes = ['sudoku-grid__cell']

  if (isSelected) {
    classes.push('sudoku-grid__cell--selected')
  }

  if ((rowIndex + 1) % BLOCK_SIZE === 0 && rowIndex < GRID_SIZE - 1) {
    classes.push('sudoku-grid__cell--block-bottom')
  }

  if ((columnIndex + 1) % BLOCK_SIZE === 0 && columnIndex < GRID_SIZE - 1) {
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

function SudokuGrid() {
  const [cellValues, setCellValues] = useState(() => Array<string>(CELL_COUNT).fill(''))
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null)

  function updateCellValue(cellIndex: number, value: string) {
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

            return (
              <div
                aria-label={
                  cellValue
                    ? `Cell ${cellDescription} value ${cellValue}`
                    : `Empty cell ${cellDescription}`
                }
                aria-selected={isSelected}
                className={getCellClassName(rowIndex, columnIndex, isSelected)}
                key={`${rowIndex}-${columnIndex}`}
                onClick={() => {
                  setSelectedCellIndex(cellIndex)
                }}
                onFocus={() => {
                  setSelectedCellIndex(cellIndex)
                }}
                onKeyDown={(event) => {
                  if (VALID_CELL_VALUE_PATTERN.test(event.key)) {
                    updateCellValue(cellIndex, event.key)
                  }
                }}
                role="gridcell"
                tabIndex={0}
              >
                {cellValue}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default SudokuGrid
