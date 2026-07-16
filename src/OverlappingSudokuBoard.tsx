import './OverlappingSudokuBoard.css'
import { useEffect, useRef, useState } from 'react'
import PuzzleMinimap from './PuzzleMinimap'
import PuzzleViewport, {
  type PuzzleViewportTransform,
} from './PuzzleViewport'
import SudokuGrid from './SudokuGrid'
import {
  extractLocalBoard,
  getOverlapGlobalKeys,
  localToGlobal,
  pointKey,
  setGlobalCell,
  type GlobalBoard,
  type OverlapTopology,
} from './sudoku/overlapping'
import {
  createEmptyPencilBoard,
  type CornerCenterMode,
  type EntryMode,
  type PencilBoard,
  type PencilStyle,
} from './sudoku/pencilMarks'
import type { Board, CellValue } from './sudoku/types'

/** CSS pixels per Sudoku cell in the unscaled world. */
export const OVERLAP_CELL_PX = 36
const GRID_PX = OVERLAP_CELL_PX * 9

interface OverlappingSudokuBoardProps {
  topology: OverlapTopology
  board: GlobalBoard
  givenBoard: GlobalBoard
  onBoardChange: (board: GlobalBoard) => void
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
}

function createLocalPencilMap(
  topology: OverlapTopology,
): Map<number, PencilBoard> {
  return new Map(
    topology.grids.map((grid) => [grid.id, createEmptyPencilBoard()]),
  )
}

function OverlappingSudokuBoard({
  topology,
  board,
  givenBoard,
  onBoardChange,
  entryMode,
  pencilStyle,
  cornerCenterMode,
}: OverlappingSudokuBoardProps) {
  const [transform, setTransform] = useState<PuzzleViewportTransform>({
    scale: 0.85,
    translateX: 0,
    translateY: 0,
  })
  const [pencilMap, setPencilMap] = useState(() =>
    createLocalPencilMap(topology),
  )
  const viewportMeasureRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 480, height: 480 })

  const contentWidth = topology.bounds.width * OVERLAP_CELL_PX
  const contentHeight = topology.bounds.height * OVERLAP_CELL_PX
  const overlapKeys = getOverlapGlobalKeys(topology)

  useEffect(() => {
    setPencilMap(createLocalPencilMap(topology))
    setTransform({ scale: 0.85, translateX: 0, translateY: 0 })
  }, [topology])

  useEffect(() => {
    const element = viewportMeasureRef.current?.querySelector('.puzzle-viewport')
    if (!element) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }
      setViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [topology])

  function updateLocalBoard(gridId: number, nextLocal: Board) {
    const grid = topology.grids.find((node) => node.id === gridId)
    if (!grid) {
      return
    }

    const nextGlobal = new Map(board)
    for (let cell = 0; cell < nextLocal.length; cell += 1) {
      const point = localToGlobal(grid.origin, cell)
      const key = pointKey(point.x, point.y)
      const given = givenBoard.get(key) ?? 0
      if (given !== 0) {
        continue
      }
      setGlobalCell(nextGlobal, point, nextLocal[cell] as CellValue)
    }
    onBoardChange(nextGlobal)
  }

  return (
    <div className="overlapping-board" ref={viewportMeasureRef}>
      <div className="overlapping-board__stage">
        <PuzzleViewport
          contentHeight={contentHeight}
          contentWidth={contentWidth}
          onTransformChange={setTransform}
          transform={transform}
        >
          <div
            className="overlapping-board__world"
            style={{ width: contentWidth, height: contentHeight }}
          >
            {topology.grids.map((grid) => {
              const localBoard = extractLocalBoard(board, grid)
              const givenCells = extractLocalBoard(givenBoard, grid).map(
                (value) => value !== 0,
              )
              const left =
                (grid.origin.x - topology.bounds.minX) * OVERLAP_CELL_PX
              const top =
                (grid.origin.y - topology.bounds.minY) * OVERLAP_CELL_PX
              const pencilBoard =
                pencilMap.get(grid.id) ?? createEmptyPencilBoard()

              // Dim non-selected overlap stacking: mark overlap cells via class
              // on the wrapper so borders still read as connected boards.
              const hasOverlap = [...overlapKeys].some((key) => {
                const [xText, yText] = key.split(',')
                const x = Number(xText)
                const y = Number(yText)
                return (
                  x >= grid.origin.x &&
                  x < grid.origin.x + 9 &&
                  y >= grid.origin.y &&
                  y < grid.origin.y + 9
                )
              })

              return (
                <div
                  className={
                    hasOverlap
                      ? 'overlapping-board__grid overlapping-board__grid--linked'
                      : 'overlapping-board__grid'
                  }
                  key={grid.id}
                  style={{
                    left,
                    top,
                    width: GRID_PX,
                    height: GRID_PX,
                    zIndex: grid.id + 1,
                  }}
                >
                  <SudokuGrid
                    ariaLabel={`Sudoku grid ${grid.id + 1}`}
                    board={localBoard}
                    cornerCenterMode={cornerCenterMode}
                    entryMode={entryMode}
                    givenCells={givenCells}
                    onBoardChange={(next) => {
                      updateLocalBoard(grid.id, next)
                    }}
                    onPencilBoardChange={(nextPencil) => {
                      setPencilMap((current) => {
                        const copy = new Map(current)
                        copy.set(grid.id, nextPencil)
                        return copy
                      })
                    }}
                    pencilBoard={pencilBoard}
                    pencilStyle={pencilStyle}
                  />
                </div>
              )
            })}
          </div>
        </PuzzleViewport>

        <PuzzleMinimap
          contentHeight={contentHeight}
          contentWidth={contentWidth}
          topology={topology}
          transform={transform}
          viewportHeight={viewportSize.height}
          viewportWidth={viewportSize.width}
        />
      </div>
    </div>
  )
}

export default OverlappingSudokuBoard
