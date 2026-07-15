import {
  CORNER_SLOTS,
  STANDARD_DIGITS,
  type CellMarks,
  type PencilStyle,
} from './sudoku/pencilMarks'
import type { CellValue } from './sudoku/types'

interface SudokuCellContentProps {
  value: CellValue
  marks: CellMarks
  pencilStyle: PencilStyle
}

function SudokuCellContent({
  value,
  marks,
  pencilStyle,
}: SudokuCellContentProps) {
  if (value) {
    return <span className="sudoku-grid__digit">{value}</span>
  }

  if (pencilStyle === 'standard') {
    return (
      <div className="sudoku-grid__standard-marks" aria-hidden="true">
        {STANDARD_DIGITS.map((digit) => (
          <span
            className="sudoku-grid__standard-mark"
            data-digit={digit}
            key={digit}
          >
            {marks.standard.includes(digit) ? digit : ''}
          </span>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="sudoku-grid__corner-marks" aria-hidden="true">
        {marks.corner.map((digit, index) => (
          <span
            className={`sudoku-grid__corner-mark sudoku-grid__corner-mark--${CORNER_SLOTS[index]}`}
            data-corner-slot={CORNER_SLOTS[index]}
            key={`${CORNER_SLOTS[index]}-${digit}`}
          >
            {digit}
          </span>
        ))}
      </div>
      {marks.center.length > 0 ? (
        <span className="sudoku-grid__center-marks" aria-hidden="true">
          {marks.center.join(' ')}
        </span>
      ) : null}
    </>
  )
}

export default SudokuCellContent
