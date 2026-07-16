import './PuzzleMinimap.css'
import type { OverlapGraph } from './sudoku/overlap'
import type { ViewportRect } from './PuzzleViewport'

interface PuzzleMinimapProps {
  graph: OverlapGraph
  viewport: ViewportRect | null
  cellSize?: number
}

const DEFAULT_CELL_SIZE = 3

function PuzzleMinimap({
  graph,
  viewport,
  cellSize = DEFAULT_CELL_SIZE,
}: PuzzleMinimapProps) {
  const width = graph.bounds.cols * cellSize
  const height = graph.bounds.rows * cellSize

  return (
    <div
      aria-label="Puzzle minimap"
      className="puzzle-minimap"
      role="img"
      style={{ width, height }}
    >
      {graph.nodes.map((node) => (
        <div
          className="puzzle-minimap__grid"
          key={node.id}
          style={{
            left: (node.originCol - graph.bounds.minCol) * cellSize,
            top: (node.originRow - graph.bounds.minRow) * cellSize,
            width: 9 * cellSize,
            height: 9 * cellSize,
          }}
          title={node.id}
        />
      ))}
      {viewport ? (
        <div
          aria-hidden="true"
          className="puzzle-minimap__viewport"
          style={{
            left: (viewport.x / (viewport.contentWidth / width)) || 0,
            top: (viewport.y / (viewport.contentHeight / height)) || 0,
            width: Math.max(
              4,
              viewport.width * (width / viewport.contentWidth),
            ),
            height: Math.max(
              4,
              viewport.height * (height / viewport.contentHeight),
            ),
          }}
        />
      ) : null}
    </div>
  )
}

export default PuzzleMinimap
