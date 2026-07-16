import './OverlappingSudokuBoard.css'
import { useEffect, useRef, useState } from 'react'
import PuzzleMinimap from './PuzzleMinimap'
import PuzzleViewport, {
  type PuzzleViewportTransform,
} from './PuzzleViewport'
import UnifiedOverlappingGrid, {
  type GlobalPencilMap,
} from './UnifiedOverlappingGrid'
import type { GlobalBoard, OverlapTopology } from './sudoku/overlapping'
import type {
  CornerCenterMode,
  EntryMode,
  PencilStyle,
} from './sudoku/pencilMarks'

/** CSS pixels per Sudoku cell in the unscaled world. */
export const OVERLAP_CELL_PX = 36

interface OverlappingSudokuBoardProps {
  topology: OverlapTopology
  board: GlobalBoard
  givenBoard: GlobalBoard
  onBoardChange: (board: GlobalBoard) => void
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
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
  const [pencilMap, setPencilMap] = useState<GlobalPencilMap>(() => new Map())
  const viewportMeasureRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 480, height: 480 })

  const contentWidth = topology.bounds.width * OVERLAP_CELL_PX
  const contentHeight = topology.bounds.height * OVERLAP_CELL_PX

  useEffect(() => {
    setPencilMap(new Map())
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
            <UnifiedOverlappingGrid
              board={board}
              cellSizePx={OVERLAP_CELL_PX}
              cornerCenterMode={cornerCenterMode}
              entryMode={entryMode}
              givenBoard={givenBoard}
              onBoardChange={onBoardChange}
              onPencilMapChange={setPencilMap}
              pencilMap={pencilMap}
              pencilStyle={pencilStyle}
              topology={topology}
            />
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
