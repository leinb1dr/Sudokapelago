import './SudokuGrid.css'
import './UnifiedOverlappingGrid.css'
import { useRef, useState } from 'react'
import SudokuCellContent from './SudokuCell'
import { GRID_SIZE } from './sudoku/grid'
import {
  getGlobalCell,
  parsePointKey,
  pointKey,
  setGlobalCell,
  type GlobalBoard,
  type OverlapTopology,
} from './sudoku/overlapping'
import {
  buildOccupiedCellKeys,
  findNextOccupiedCell,
  getUnifiedCellBorders,
  type CellEdgeStyle,
} from './sudoku/overlapping/unifiedLayout'
import {
  clearVisiblePencilMarks,
  createEmptyCellMarks,
  getCellAccessibleName,
  toggleDigitValue,
  togglePencilMark,
  type CellMarks,
  type CornerCenterMode,
  type EntryMode,
  type PencilStyle,
} from './sudoku/pencilMarks'
import type { CellValue, Digit } from './sudoku/types'

const VALID_CELL_VALUE_PATTERN = /^[1-9]$/

const NAVIGATION_KEYS: Readonly<
  Record<string, { deltaX: number; deltaY: number }>
> = {
  ArrowUp: { deltaX: 0, deltaY: -1 },
  ArrowDown: { deltaX: 0, deltaY: 1 },
  ArrowLeft: { deltaX: -1, deltaY: 0 },
  ArrowRight: { deltaX: 1, deltaY: 0 },
  w: { deltaX: 0, deltaY: -1 },
  W: { deltaX: 0, deltaY: -1 },
  s: { deltaX: 0, deltaY: 1 },
  S: { deltaX: 0, deltaY: 1 },
  a: { deltaX: -1, deltaY: 0 },
  A: { deltaX: -1, deltaY: 0 },
  d: { deltaX: 1, deltaY: 0 },
  D: { deltaX: 1, deltaY: 0 },
}

export type GlobalPencilMap = Map<string, CellMarks>

interface UnifiedOverlappingGridProps {
  topology: OverlapTopology
  board: GlobalBoard
  givenBoard: GlobalBoard
  pencilMap: GlobalPencilMap
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
  cellSizePx: number
  onBoardChange: (board: GlobalBoard) => void
  onPencilMapChange: (pencilMap: GlobalPencilMap) => void
}

function edgeClass(edge: 'right' | 'bottom', style: CellEdgeStyle): string {
  if (style === 'none') {
    return `unified-grid__cell--${edge}-none`
  }
  if (style === 'box') {
    return `unified-grid__cell--${edge}-box`
  }
  return `unified-grid__cell--${edge}-thin`
}

function getOccupiedCellClassName(
  borders: ReturnType<typeof getUnifiedCellBorders>,
  isSelected: boolean,
  isGiven: boolean,
): string {
  const classes = [
    'unified-grid__cell',
    'unified-grid__cell--occupied',
    edgeClass('right', borders.right),
    edgeClass('bottom', borders.bottom),
  ]

  if (isSelected) {
    classes.push('unified-grid__cell--selected')
  }
  if (isGiven) {
    classes.push('unified-grid__cell--given')
  }

  return classes.join(' ')
}

function UnifiedOverlappingGrid({
  topology,
  board,
  givenBoard,
  pencilMap,
  entryMode,
  pencilStyle,
  cornerCenterMode,
  cellSizePx,
  onBoardChange,
  onPencilMapChange,
}: UnifiedOverlappingGridProps) {
  const occupied = buildOccupiedCellKeys(topology)
  const { minX, minY, width, height } = topology.bounds
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const cellRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  function selectCell(x: number, y: number) {
    const key = pointKey(x, y)
    setSelectedKey(key)
    cellRefs.current.get(key)?.focus()
  }

  function navigateFromCell(
    event: React.KeyboardEvent<HTMLDivElement>,
    x: number,
    y: number,
  ) {
    const navigation = NAVIGATION_KEYS[event.key]
    if (!navigation) {
      return
    }

    event.preventDefault()
    const start =
      selectedKey !== null ? parsePointKey(selectedKey) : { x, y }
    const next = findNextOccupiedCell(
      topology,
      occupied,
      start,
      navigation.deltaX,
      navigation.deltaY,
    )
    if (next) {
      selectCell(next.x, next.y)
    }
  }

  function updateCellValue(x: number, y: number, value: CellValue) {
    const key = pointKey(x, y)
    if ((givenBoard.get(key) ?? 0) !== 0) {
      return
    }

    const next = new Map(board)
    setGlobalCell(next, { x, y }, value)
    onBoardChange(next)
  }

  function handleDigitInput(x: number, y: number, digit: Digit) {
    const key = pointKey(x, y)
    if ((givenBoard.get(key) ?? 0) !== 0) {
      return
    }

    if (entryMode === 'digit') {
      updateCellValue(
        x,
        y,
        toggleDigitValue(getGlobalCell(board, { x, y }), digit),
      )
      return
    }

    if (getGlobalCell(board, { x, y }) !== 0) {
      return
    }

    const currentMarks = pencilMap.get(key) ?? createEmptyCellMarks()
    const nextMarks = togglePencilMark(
      currentMarks,
      digit,
      pencilStyle,
      cornerCenterMode,
    )
    const nextPencil = new Map(pencilMap)
    nextPencil.set(key, nextMarks)
    onPencilMapChange(nextPencil)
  }

  function handleClearInput(x: number, y: number) {
    const key = pointKey(x, y)
    if ((givenBoard.get(key) ?? 0) !== 0) {
      return
    }

    if (getGlobalCell(board, { x, y }) !== 0) {
      updateCellValue(x, y, 0)
      return
    }

    if (entryMode === 'pencil') {
      const currentMarks = pencilMap.get(key) ?? createEmptyCellMarks()
      const nextPencil = new Map(pencilMap)
      nextPencil.set(
        key,
        clearVisiblePencilMarks(currentMarks, pencilStyle, cornerCenterMode),
      )
      onPencilMapChange(nextPencil)
    }
  }

  const activePoint = selectedKey !== null ? parsePointKey(selectedKey) : null

  return (
    <div
      className="unified-grid-root"
      style={{
        width: width * cellSizePx,
        height: height * cellSizePx,
      }}
    >
      <div
        aria-label="Overlapping Sudoku grid"
        className="unified-grid"
        role="grid"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSizePx}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSizePx}px)`,
        }}
      >
        {Array.from({ length: height }, (_, rowOffset) => {
          const y = minY + rowOffset
          return (
            <div className="unified-grid__row" key={y} role="row">
              {Array.from({ length: width }, (_, columnOffset) => {
                const x = minX + columnOffset
                const key = pointKey(x, y)
                const occupiedCell = occupied.has(key)

                if (!occupiedCell) {
                  return (
                    <div
                      aria-hidden="true"
                      className="unified-grid__cell unified-grid__cell--empty"
                      key={key}
                    />
                  )
                }

                const borders = getUnifiedCellBorders(topology, occupied, x, y)
                const cellValue = getGlobalCell(board, { x, y })
                const cellMarks = pencilMap.get(key) ?? createEmptyCellMarks()
                const isGiven = (givenBoard.get(key) ?? 0) !== 0
                const isSelected = selectedKey === key
                const cellDescription = `row ${rowOffset + 1} column ${columnOffset + 1}`

                return (
                  <div
                    ref={(element) => {
                      cellRefs.current.set(key, element)
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
                    className={getOccupiedCellClassName(
                      borders,
                      isSelected,
                      isGiven,
                    )}
                    key={key}
                    onClick={() => {
                      selectCell(x, y)
                    }}
                    onFocus={() => {
                      setSelectedKey(key)
                    }}
                    onKeyDown={(event) => {
                      if (NAVIGATION_KEYS[event.key]) {
                        navigateFromCell(event, x, y)
                        return
                      }

                      const target = activePoint ?? { x, y }
                      if (VALID_CELL_VALUE_PATTERN.test(event.key)) {
                        handleDigitInput(
                          target.x,
                          target.y,
                          Number(event.key) as Digit,
                        )
                      } else if (
                        event.key === 'Backspace' ||
                        event.key === 'Delete'
                      ) {
                        handleClearInput(target.x, target.y)
                      }
                    }}
                    role="gridcell"
                    tabIndex={isSelected ? 0 : -1}
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
          )
        })}
      </div>

      <div aria-hidden="true" className="unified-grid__outlines">
        {topology.grids.map((grid) => {
          const left = (grid.origin.x - minX) * cellSizePx
          const top = (grid.origin.y - minY) * cellSizePx
          const size = GRID_SIZE * cellSizePx
          return (
            <div
              className="unified-grid__board-outline"
              key={`outline-${grid.id}`}
              style={{
                left,
                top,
                width: size,
                height: size,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default UnifiedOverlappingGrid
