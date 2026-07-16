import { describe, expect, it } from 'vitest'
import {
  buildSpiralTopology,
  createOneBoxSixGridTopology,
  createThreeBoxSevenGridTopology,
  createTwoBoxSevenGridTopology,
  getOverlapGlobalKeys,
  getUniqueGlobalCellCount,
  MAX_OVERLAPPING_GRIDS,
} from '../../src/sudoku/overlapping/topology'
import { sharedCellCountForOverlap } from '../../src/sudoku/overlapping/coordinates'

describe('overlapping topology graph', () => {
  it('builds a single-grid topology without edges', () => {
    const topology = buildSpiralTopology(1, 1)
    expect(topology.grids).toHaveLength(1)
    expect(topology.edges).toHaveLength(0)
    expect(topology.bounds).toEqual({
      minX: 0,
      minY: 0,
      maxX: 9,
      maxY: 9,
      width: 9,
      height: 9,
    })
  })

  it('creates the reference 1-box / 6-grid topology', () => {
    const topology = createOneBoxSixGridTopology()
    expect(topology.grids).toHaveLength(6)
    expect(topology.overlapBoxes).toBe(1)
    expect(topology.edges.length).toBeGreaterThanOrEqual(5)
    for (const edge of topology.edges) {
      expect(edge.sharedGlobalCells).toHaveLength(sharedCellCountForOverlap(1))
    }
    expect(getUniqueGlobalCellCount(topology)).toBeLessThan(6 * 81)
    expect(getOverlapGlobalKeys(topology).size).toBeGreaterThan(0)
  })

  it('creates the reference 2-box / 7-grid and 3-box / 7-grid topologies', () => {
    const twoBox = createTwoBoxSevenGridTopology()
    const threeBox = createThreeBoxSevenGridTopology()

    expect(twoBox.grids).toHaveLength(7)
    expect(threeBox.grids).toHaveLength(7)
    expect(twoBox.edges.every((edge) => edge.overlapBoxes === 2)).toBe(true)
    expect(threeBox.edges.every((edge) => edge.overlapBoxes === 3)).toBe(true)
  })

  it('rejects invalid grid counts', () => {
    expect(() => buildSpiralTopology(1, 0)).toThrow(/1–10/)
    expect(() => buildSpiralTopology(1, MAX_OVERLAPPING_GRIDS + 1)).toThrow(
      /1–10/,
    )
  })

  it('keeps every non-center grid connected through an overlap edge', () => {
    const topology = buildSpiralTopology(1, 5)
    const connected = new Set<number>([0])
    for (const edge of topology.edges) {
      if (connected.has(edge.from)) {
        connected.add(edge.to)
      }
      if (connected.has(edge.to)) {
        connected.add(edge.from)
      }
    }
    expect(connected.size).toBe(topology.grids.length)
  })
})
