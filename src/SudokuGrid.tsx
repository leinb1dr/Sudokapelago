import './SudokuGrid.css'

const GRID_SIZE = 9
const BLOCK_SIZE = 3

function getCellClassName(rowIndex: number, columnIndex: number) {
  const classes = ['sudoku-grid__cell']

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
  return (
    <div className="sudoku-grid" role="grid" aria-label="Empty Sudoku grid">
      {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
        <div className="sudoku-grid__row" role="row" key={rowIndex}>
          {Array.from({ length: GRID_SIZE }).map((_, columnIndex) => (
            <div
              aria-label={`Empty cell row ${rowIndex + 1} column ${columnIndex + 1}`}
              className={getCellClassName(rowIndex, columnIndex)}
              key={`${rowIndex}-${columnIndex}`}
              role="gridcell"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default SudokuGrid
