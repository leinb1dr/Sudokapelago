import './PuzzleMinimap.css'
import { getVisibleContentRect } from './puzzleViewportMath'
import type { PuzzleViewportTransform } from './PuzzleViewport'
import type { OverlapTopology } from './sudoku/overlapping'

interface PuzzleMinimapProps {
  topology: OverlapTopology
  transform: PuzzleViewportTransform
  /** Unscaled world size matching the viewport content. */
  contentWidth: number
  contentHeight: number
  /** Visible viewport size in CSS pixels. */
  viewportWidth: number
  viewportHeight: number
}

const MINIMAP_MAX = 140

function PuzzleMinimap({
  topology,
  transform,
  contentWidth,
  contentHeight,
  viewportWidth,
  viewportHeight,
}: PuzzleMinimapProps) {
  const worldWidth = Math.max(contentWidth, 1)
  const worldHeight = Math.max(contentHeight, 1)
  const fit = Math.min(MINIMAP_MAX / worldWidth, MINIMAP_MAX / worldHeight)
  const mapWidth = worldWidth * fit
  const mapHeight = worldHeight * fit

  const { bounds } = topology
  const cellW = contentWidth / bounds.width
  const cellH = contentHeight / bounds.height

  const visible = getVisibleContentRect(
    transform,
    contentWidth,
    contentHeight,
    viewportWidth,
    viewportHeight,
  )

  return (
    <div
      aria-hidden="true"
      className="puzzle-minimap"
      style={{ width: mapWidth, height: mapHeight }}
    >
      <span className="puzzle-minimap__label">Overview</span>
      {topology.grids.map((grid) => {
        const left = (grid.origin.x - bounds.minX) * cellW * fit
        const top = (grid.origin.y - bounds.minY) * cellH * fit
        const width = 9 * cellW * fit
        const height = 9 * cellH * fit
        return (
          <div
            className="puzzle-minimap__grid"
            key={grid.id}
            style={{ left, top, width, height }}
            title={`Grid ${grid.id + 1}`}
          />
        )
      })}
      <div
        className="puzzle-minimap__viewport"
        style={{
          left: visible.left * fit,
          top: visible.top * fit,
          width: visible.width * fit,
          height: visible.height * fit,
        }}
      />
    </div>
  )
}

export default PuzzleMinimap
