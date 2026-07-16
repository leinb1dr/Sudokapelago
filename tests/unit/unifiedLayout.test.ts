import { describe, expect, it } from 'vitest'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'
import {
  buildOccupiedCellKeys,
  findNextOccupiedCell,
  getLogicalBoardRect,
  getUnifiedCellBorders,
  isCellOccupied,
} from '../../src/sudoku/overlapping/unifiedLayout'

describe('unified overlapping layout', () => {
  it('uses a 21×21 lattice for classic 1-box × 5-grid Samurai topology', () => {
    const topology = buildSpiralTopology(1, 5)
    expect(topology.bounds.width).toBe(21)
    expect(topology.bounds.height).toBe(21)

    const { minX, minY } = topology.bounds
    const normalizedRects = topology.grids
      .map((grid) => {
        const rect = getLogicalBoardRect(grid.origin)
        return {
          minX: rect.minX - minX,
          minY: rect.minY - minY,
          maxX: rect.maxX - minX,
          maxY: rect.maxY - minY,
        }
      })
      .sort(
        (left, right) =>
          left.minY - right.minY || left.minX - right.minX,
      )

    expect(normalizedRects).toEqual([
      { minX: 0, minY: 0, maxX: 8, maxY: 8 },
      { minX: 12, minY: 0, maxX: 20, maxY: 8 },
      { minX: 6, minY: 6, maxX: 14, maxY: 14 },
      { minX: 0, minY: 12, maxX: 8, maxY: 20 },
      { minX: 12, minY: 12, maxX: 20, maxY: 20 },
    ])
  })

  it('leaves the corridor between top boards unusable and borderless', () => {
    const topology = buildSpiralTopology(1, 5)
    const occupied = buildOccupiedCellKeys(topology)
    const { minX, minY } = topology.bounds

    // Relative hole [(9,0),(11,5)] → global coords shifted by bounds origin.
    for (let y = 0; y <= 5; y += 1) {
      for (let x = 9; x <= 11; x += 1) {
        const globalX = minX + x
        const globalY = minY + y
        expect(isCellOccupied(occupied, globalX, globalY)).toBe(false)
        expect(
          getUnifiedCellBorders(topology, occupied, globalX, globalY),
        ).toEqual({ right: 'none', bottom: 'none' })
      }
    }
  })

  it('draws box borders inside boards and omits perimeter cell borders', () => {
    const topology = buildSpiralTopology(1, 2)
    const occupied = buildOccupiedCellKeys(topology)
    const center = topology.grids[0]!
    const { origin } = center

    // Internal thin edge between (0,0) and (1,0) in local coords.
    expect(
      getUnifiedCellBorders(topology, occupied, origin.x, origin.y),
    ).toEqual({ right: 'thin', bottom: 'thin' })

    // Internal 3×3 box boundary after local column 2.
    expect(
      getUnifiedCellBorders(
        topology,
        occupied,
        origin.x + 2,
        origin.y,
      ).right,
    ).toBe('box')

    // Right perimeter of the board — outline overlay owns this edge.
    expect(
      getUnifiedCellBorders(
        topology,
        occupied,
        origin.x + 8,
        origin.y,
      ).right,
    ).toBe('none')

    // Bottom perimeter of the board.
    expect(
      getUnifiedCellBorders(
        topology,
        occupied,
        origin.x,
        origin.y + 8,
      ).bottom,
    ).toBe('none')
  })

  it('skips holes when navigating between occupied cells', () => {
    const topology = buildSpiralTopology(1, 5)
    const occupied = buildOccupiedCellKeys(topology)
    const { minX, minY } = topology.bounds

    // From the right edge of the top-left board toward the top-right board.
    const start = { x: minX + 8, y: minY + 0 }
    const next = findNextOccupiedCell(topology, occupied, start, 1, 0)
    expect(next).toEqual({ x: minX + 12, y: minY + 0 })
  })
})
