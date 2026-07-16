import { describe, expect, it } from 'vitest'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'
import {
  buildActiveCellKeySet,
  findNextActiveCell,
  getBoardOutlineRect,
  getUnifiedCellBorders,
  isActiveGlobalCell,
} from '../../src/sudoku/overlapping/unifiedGrid'
import { pointKey } from '../../src/sudoku/overlapping/coordinates'

describe('unified overlapping grid geometry', () => {
  it('uses a 21×21 world for the 5-grid 1-box topology', () => {
    const topology = buildSpiralTopology(1, 5)
    expect(topology.bounds.width).toBe(21)
    expect(topology.bounds.height).toBe(21)
  })

  it('marks only cells inside a logical board as active', () => {
    const topology = buildSpiralTopology(1, 5)
    const { minX, minY } = topology.bounds

    // Normalized NW board covers display [(0,0),(8,8)] → global origins offset by min.
    expect(isActiveGlobalCell(topology, { x: minX, y: minY })).toBe(true)
    // Gap between NW and NE boards near the top strip: display [(9,0),(11,5)].
    expect(isActiveGlobalCell(topology, { x: minX + 9, y: minY })).toBe(false)
    expect(isActiveGlobalCell(topology, { x: minX + 10, y: minY + 3 })).toBe(
      false,
    )
    // Center board interior.
    expect(isActiveGlobalCell(topology, { x: minX + 10, y: minY + 10 })).toBe(
      true,
    )
  })

  it('draws thick logical outlines for each 9×9 board, not stacked frames', () => {
    const topology = buildSpiralTopology(1, 5)
    const cellPx = 10
    const outlines = topology.grids.map((grid) =>
      getBoardOutlineRect(topology, grid, cellPx),
    )

    expect(outlines).toHaveLength(5)
    for (const outline of outlines) {
      expect(outline.width).toBe(90)
      expect(outline.height).toBe(90)
    }

    const normalized = outlines
      .map((outline) => ({
        left: outline.left / cellPx,
        top: outline.top / cellPx,
      }))
      .sort((a, b) => a.top - b.top || a.left - b.left)

    expect(normalized).toEqual([
      { left: 0, top: 0 },
      { left: 12, top: 0 },
      { left: 6, top: 6 },
      { left: 0, top: 12 },
      { left: 12, top: 12 },
    ])
  })

  it('omits cell borders on gap edges and uses block borders on 3×3 lines', () => {
    const topology = buildSpiralTopology(1, 5)
    const activeKeys = buildActiveCellKeySet(topology)
    const { minX, minY } = topology.bounds

    // Gap cell has no borders.
    const gapBorders = getUnifiedCellBorders(
      topology,
      { x: minX + 9, y: minY },
      activeKeys,
    )
    expect(gapBorders).toEqual({ right: 'none', bottom: 'none' })

    // Interior of NW board: after local column 2 → block right border.
    // NW origin is (-6,-6); local (2,0) → global (-4,-6) → display (2,0).
    const blockPoint = { x: minX + 2, y: minY }
    expect(activeKeys.has(pointKey(blockPoint.x, blockPoint.y))).toBe(true)
    const blockBorders = getUnifiedCellBorders(topology, blockPoint, activeKeys)
    expect(blockBorders.right).toBe('block')

    // Active cell on the outer right edge of NW (display x=8) beside gap/other:
    // NW right edge is at display x=8; neighbor x=9 may be gap at y=0.
    const edgeBorders = getUnifiedCellBorders(
      topology,
      { x: minX + 8, y: minY },
      activeKeys,
    )
    expect(edgeBorders.right).toBe('none')
  })

  it('skips inactive cells when finding the next navigation target', () => {
    const topology = buildSpiralTopology(1, 5)
    const activeKeys = buildActiveCellKeySet(topology)
    const { minX, minY } = topology.bounds

    // From NW board right edge at top row toward the east across the gap.
    const from = { x: minX + 8, y: minY }
    const next = findNextActiveCell(topology, from, 1, 0, activeKeys)
    expect(next).not.toBeNull()
    expect(activeKeys.has(pointKey(next!.x, next!.y))).toBe(true)
    expect(next!.x).toBeGreaterThan(from.x + 1)
  })
})
