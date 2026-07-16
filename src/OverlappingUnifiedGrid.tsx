import './SudokuGrid.css'
import { useEffect, useRef, useState } from 'react'
import SudokuCellContent from './SudokuCell'
import {
  buildActiveCellKeySet,
  findNextActiveCell,
  getBoardOutlineRect,
  getUnifiedCellBorders,
  gridsContainingPoint,
} from './sudoku/overlapping/unifiedGrid'
import {
  getGlobalCell,
  pointKey,
  setGlobalCell,
  type GlobalBoard,
  type OverlapTopology,
} from './sudoku/overlapping'
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

interface OverlappingUnifiedGridProps {
  topology: OverlapTopology
  board: GlobalBoard
  givenBoard: GlobalBoard
  onBoardChange: (board: GlobalBoard) => void
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
  cellPx: number
}

function getCellClassName(options: {
  isActive: boolean
  isSelected: boolean
  isGiven: boolean
  right: 'none' | 'thin' | 'block'
  bottom: 'none' | 'thin' | 'block'
}): string {
  const classes = ['overlapping-board__cell']

  if (!options.isActive) {
    classes.push('overlapping-board__cell--inactive')
    return classes.join(' ')
  }

  if (options.isSelected) {
    classes.push('overlapping-board__cell--selected')
  }

  if (options.isGiven) {
    classes.push('overlapping-board__cell--given')
  }

  if (options.right === 'thin') {
    classes.push('overlapping-board__cell--right-thin')
  } else if (options.right === 'block') {
    classes.push('overlapping-board__cell--right-block')
  }

  if (options.bottom === 'thin') {
    classes.push('overlapping-board__cell--bottom-thin')
  } else if (options.bottom === 'block') {
    classes.push('overlapping-board__cell--bottom-block')
  }

  return classes.join(' ')
}

function OverlappingUnifiedGrid({
  topology,
  board,
  givenBoard,
  onBoardChange,
  entryMode,
  pencilStyle,
  cornerCenterMode,
  cellPx,
}: OverlappingUnifiedGridProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [pencilMap, setPencilMap] = useState(() => new Map<string, CellMarks>())
  const cellRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const activeKeys = buildActiveCellKeySet(topology)
  const { bounds } = topology

  useEffect(() => {
    setPencilMap(new Map())
    setSelectedKey(null)
  }, [topology])

  function selectCell(x: number, y: number) {
    const key = pointKey(x, y)
    if (!activeKeys.has(key)) {
      return
    }
    setSelectedKey(key)
    cellRefs.current.get(key)?.focus()
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

    const current = pencilMap.get(key) ?? createEmptyCellMarks()
    const nextMarks = togglePencilMark(
      current,
      digit,
      pencilStyle,
      cornerCenterMode,
    )
    setPencilMap((map) => {
      const copy = new Map(map)
      copy.set(key, nextMarks)
      return copy
    })
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
      const current = pencilMap.get(key) ?? createEmptyCellMarks()
      setPencilMap((map) => {
        const copy = new Map(map)
        copy.set(
          key,
          clearVisiblePencilMarks(current, pencilStyle, cornerCenterMode),
        )
        return copy
      })
    }
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
    const next = findNextActiveCell(
      topology,
      { x, y },
      navigation.deltaX,
      navigation.deltaY,
      activeKeys,
    )
    if (next) {
      selectCell(next.x, next.y)
    }
  }

  const cells: React.ReactNode[] = []
  for (let y = bounds.minY; y < bounds.maxY; y += 1) {
    for (let x = bounds.minX; x < bounds.maxX; x += 1) {
      const key = pointKey(x, y)
      const isActive = activeKeys.has(key)
      const borders = getUnifiedCellBorders(topology, { x, y }, activeKeys)
      const value = isActive ? getGlobalCell(board, { x, y }) : 0
      const isGiven = isActive && (givenBoard.get(key) ?? 0) !== 0
      const marks = pencilMap.get(key) ?? createEmptyCellMarks()
      const isSelected = selectedKey === key
      const grids = isActive ? gridsContainingPoint(topology, { x, y }) : []
      const gridLabels = grids.map((grid) => grid.id + 1).join(', ')
      const cellDescription = isActive
        ? `global ${x - bounds.minX + 1},${y - bounds.minY + 1} (grid${grids.length > 1 ? 's' : ''} ${gridLabels})`
        : `gap ${x - bounds.minX + 1},${y - bounds.minY + 1}`

      cells.push(
        <div
          aria-hidden={isActive ? undefined : true}
          aria-label={
            isActive
              ? getCellAccessibleName({
                  value,
                  marks,
                  pencilStyle,
                  isGiven,
                  cellDescription,
                })
              : undefined
          }
          aria-readonly={isActive ? isGiven : undefined}
          aria-selected={isActive ? isSelected : undefined}
          className={getCellClassName({
            isActive,
            isSelected,
            isGiven,
            right: borders.right,
            bottom: borders.bottom,
          })}
          key={key}
          onClick={() => {
            if (isActive) {
              selectCell(x, y)
            }
          }}
          onFocus={() => {
            if (isActive) {
              setSelectedKey(key)
            }
          }}
          onKeyDown={(event) => {
            if (!isActive) {
              return
            }
            if (NAVIGATION_KEYS[event.key]) {
              navigateFromCell(event, x, y)
              return
            }
            if (VALID_CELL_VALUE_PATTERN.test(event.key)) {
              handleDigitInput(x, y, Number(event.key) as Digit)
            } else if (event.key === 'Backspace' || event.key === 'Delete') {
              handleClearInput(x, y)
            }
          }}
          ref={(element) => {
            if (isActive) {
              cellRefs.current.set(key, element)
            }
          }}
          role={isActive ? 'gridcell' : undefined}
          tabIndex={isActive ? (isSelected ? 0 : -1) : undefined}
        >
          {isActive ? (
            <SudokuCellContent
              marks={marks}
              pencilStyle={pencilStyle}
              value={value}
            />
          ) : null}
        </div>,
      )
    }
  }

  const worldWidth = bounds.width * cellPx
  const worldHeight = bounds.height * cellPx

  return (
    <div
      className="overlapping-board__unified-wrap"
      style={{ width: worldWidth, height: worldHeight }}
    >
      <div
        aria-label="Overlapping Sudoku grid"
        className="overlapping-board__unified"
        role="grid"
        style={{
          width: worldWidth,
          height: worldHeight,
          gridTemplateColumns: `repeat(${bounds.width}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${bounds.height}, ${cellPx}px)`,
        }}
      >
        {cells}
      </div>
      {topology.grids.map((grid) => {
        const rect = getBoardOutlineRect(topology, grid, cellPx)
        return (
          <div
            aria-hidden="true"
            className="overlapping-board__outline"
            data-grid-id={grid.id}
            key={`outline-${grid.id}`}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            }}
            title={`Sudoku grid ${grid.id + 1}`}
          />
        )
      })}
    </div>
  )
}

export default OverlappingUnifiedGrid
