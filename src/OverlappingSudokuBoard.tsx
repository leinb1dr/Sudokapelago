import './OverlappingSudokuBoard.css'
import './SudokuGrid.css'
import { useMemo, useRef, useState } from 'react'
import SudokuCellContent from './SudokuCell'
import {
  BOX_SIZE,
  GRID_SIZE,
} from './sudoku/grid'
import {
  globalIndex,
  globalToLocal,
  gridsContaining,
  indexToGlobal,
  type GlobalBoard,
  type OverlapGraph,
} from './sudoku/overlap'
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
import type { CellValue, Digit } from './sudoku/types'

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

export const OVERLAP_CELL_PX = 40

interface OverlappingSudokuBoardProps {
  graph: OverlapGraph
  board: GlobalBoard
  givenBoard?: GlobalBoard
  pencilBoard: PencilBoard
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
  onBoardChange: (board: GlobalBoard) => void
  onPencilBoardChange: (pencilBoard: PencilBoard) => void
  cellSize?: number
}

function isBoxBoundary(
  graph: OverlapGraph,
  row: number,
  col: number,
  edge: 'right' | 'bottom',
): boolean {
  for (const node of graph.nodes) {
    const local = globalToLocal(node, row, col)
    if (local === null) {
      continue
    }
    const localRow = Math.floor(local / GRID_SIZE)
    const localCol = local % GRID_SIZE
    if (edge === 'right' && (localCol + 1) % BOX_SIZE === 0 && localCol < GRID_SIZE - 1) {
      return true
    }
    if (edge === 'bottom' && (localRow + 1) % BOX_SIZE === 0 && localRow < GRID_SIZE - 1) {
      return true
    }
  }
  return false
}

function isGridOuterEdge(
  graph: OverlapGraph,
  row: number,
  col: number,
  edge: 'right' | 'bottom' | 'left' | 'top',
): boolean {
  for (const node of graph.nodes) {
    const local = globalToLocal(node, row, col)
    if (local === null) {
      continue
    }
    const localRow = Math.floor(local / GRID_SIZE)
    const localCol = local % GRID_SIZE
    if (edge === 'right' && localCol === GRID_SIZE - 1) {
      return true
    }
    if (edge === 'bottom' && localRow === GRID_SIZE - 1) {
      return true
    }
    if (edge === 'left' && localCol === 0) {
      return true
    }
    if (edge === 'top' && localRow === 0) {
      return true
    }
  }
  return false
}

function getCellClassName(
  graph: OverlapGraph,
  row: number,
  col: number,
  isSelected: boolean,
  isGiven: boolean,
  isOverlap: boolean,
) {
  const classes = ['sudoku-grid__cell', 'overlap-board__cell']

  if (isSelected) {
    classes.push('sudoku-grid__cell--selected')
  }
  if (isGiven) {
    classes.push('sudoku-grid__cell--given')
  }
  if (isOverlap) {
    classes.push('overlap-board__cell--overlap')
  }
  if (isBoxBoundary(graph, row, col, 'right')) {
    classes.push('sudoku-grid__cell--block-right')
  }
  if (isBoxBoundary(graph, row, col, 'bottom')) {
    classes.push('sudoku-grid__cell--block-bottom')
  }
  if (isGridOuterEdge(graph, row, col, 'right')) {
    classes.push('overlap-board__cell--grid-right')
  }
  if (isGridOuterEdge(graph, row, col, 'bottom')) {
    classes.push('overlap-board__cell--grid-bottom')
  }
  if (isGridOuterEdge(graph, row, col, 'left')) {
    classes.push('overlap-board__cell--grid-left')
  }
  if (isGridOuterEdge(graph, row, col, 'top')) {
    classes.push('overlap-board__cell--grid-top')
  }

  return classes.join(' ')
}

function OverlappingSudokuBoard({
  graph,
  board,
  givenBoard,
  pencilBoard,
  entryMode,
  pencilStyle,
  cornerCenterMode,
  onBoardChange,
  onPencilBoardChange,
  cellSize = OVERLAP_CELL_PX,
}: OverlappingSudokuBoardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])

  const presentIndexes = useMemo(() => {
    const indexes: number[] = []
    for (let index = 0; index < board.length; index += 1) {
      if (board[index] !== null) {
        indexes.push(index)
      }
    }
    return indexes
  }, [board])

  const overlapIndexes = useMemo(() => {
    const set = new Set<number>()
    for (const index of presentIndexes) {
      const { row, col } = indexToGlobal(graph.bounds, index)
      if (gridsContaining(graph, row, col).length > 1) {
        set.add(index)
      }
    }
    return set
  }, [graph, presentIndexes])

  function selectCell(index: number) {
    setSelectedIndex(index)
    cellRefs.current[index]?.focus()
  }

  function findNeighbor(
    fromIndex: number,
    deltaRow: number,
    deltaColumn: number,
  ): number {
    const start = indexToGlobal(graph.bounds, fromIndex)
    let row = start.row + deltaRow
    let col = start.col + deltaColumn

    while (
      row >= graph.bounds.minRow &&
      col >= graph.bounds.minCol &&
      row < graph.bounds.minRow + graph.bounds.rows &&
      col < graph.bounds.minCol + graph.bounds.cols
    ) {
      const index = globalIndex(graph.bounds, row, col)
      if (board[index] !== null) {
        return index
      }
      row += deltaRow
      col += deltaColumn
    }

    return fromIndex
  }

  function updateCellValue(index: number, value: CellValue) {
    const given = givenBoard?.[index]
    if (given !== null && given !== undefined && given !== 0) {
      return
    }

    onBoardChange(
      board.map((current, currentIndex) =>
        currentIndex === index ? value : current,
      ),
    )
  }

  function handleDigitInput(index: number, digit: Digit) {
    const given = givenBoard?.[index]
    if (given !== null && given !== undefined && given !== 0) {
      return
    }

    const current = board[index]
    if (current === null) {
      return
    }

    if (entryMode === 'digit') {
      updateCellValue(index, toggleDigitValue(current, digit))
      return
    }

    if (current !== 0) {
      return
    }

    const nextMarks = togglePencilMark(
      pencilBoard[index],
      digit,
      pencilStyle,
      cornerCenterMode,
    )
    onPencilBoardChange(
      updatePencilBoardCell(pencilBoard, index, nextMarks),
    )
  }

  function handleClearInput(index: number) {
    const given = givenBoard?.[index]
    if (given !== null && given !== undefined && given !== 0) {
      return
    }

    const current = board[index]
    if (current === null) {
      return
    }

    if (current !== 0) {
      updateCellValue(index, 0)
      return
    }

    if (entryMode === 'pencil') {
      onPencilBoardChange(
        updatePencilBoardCell(
          pencilBoard,
          index,
          clearVisiblePencilMarks(
            pencilBoard[index],
            pencilStyle,
            cornerCenterMode,
          ),
        ),
      )
    }
  }

  return (
    <div
      aria-label="Overlapping Sudoku board"
      className="overlap-board"
      role="grid"
      style={{
        width: graph.bounds.cols * cellSize,
        height: graph.bounds.rows * cellSize,
        gridTemplateColumns: `repeat(${graph.bounds.cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${graph.bounds.rows}, ${cellSize}px)`,
      }}
    >
      {Array.from({ length: graph.bounds.rows * graph.bounds.cols }, (_, index) => {
        const value = board[index]
        if (value === null) {
          return (
            <div
              aria-hidden="true"
              className="overlap-board__hole"
              key={`hole-${index}`}
            />
          )
        }

        const { row, col } = indexToGlobal(graph.bounds, index)
        const isSelected = selectedIndex === index
        const givenValue = givenBoard?.[index] ?? 0
        const isGiven = givenValue !== null && givenValue !== 0
        const cellMarks = pencilBoard[index]
        const cellDescription = `global row ${row + 1} column ${col + 1}`

        return (
          <div
            ref={(element) => {
              cellRefs.current[index] = element
            }}
            aria-label={getCellAccessibleName({
              value,
              marks: cellMarks,
              pencilStyle,
              isGiven,
              cellDescription,
            })}
            aria-readonly={isGiven}
            aria-selected={isSelected}
            className={getCellClassName(
              graph,
              row,
              col,
              isSelected,
              isGiven,
              overlapIndexes.has(index),
            )}
            key={`cell-${index}`}
            onClick={() => {
              selectCell(index)
            }}
            onFocus={() => {
              setSelectedIndex(index)
            }}
            onKeyDown={(event) => {
              const navigation = NAVIGATION_KEYS[event.key]
              if (navigation) {
                event.preventDefault()
                const current = selectedIndex ?? index
                selectCell(
                  findNeighbor(
                    current,
                    navigation.deltaRow,
                    navigation.deltaColumn,
                  ),
                )
                return
              }

              if (VALID_CELL_VALUE_PATTERN.test(event.key)) {
                handleDigitInput(
                  selectedIndex ?? index,
                  Number(event.key) as Digit,
                )
              } else if (event.key === 'Backspace' || event.key === 'Delete') {
                handleClearInput(selectedIndex ?? index)
              }
            }}
            role="gridcell"
            style={{
              gridColumn: col - graph.bounds.minCol + 1,
              gridRow: row - graph.bounds.minRow + 1,
            }}
            tabIndex={selectedIndex === index ? 0 : -1}
          >
            <SudokuCellContent
              marks={cellMarks}
              pencilStyle={pencilStyle}
              value={value}
            />
          </div>
        )
      })}
    </div>
  )
}

export default OverlappingSudokuBoard
