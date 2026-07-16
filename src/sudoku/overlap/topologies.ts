import { createOverlapGraph } from './coordinates'
import type {
  GridNode,
  OverlapGraph,
  TopologyDefinition,
  TopologyId,
} from './types'

function nodesFromOrigins(
  origins: readonly { originRow: number; originCol: number }[],
): GridNode[] {
  return origins.map((origin, index) => ({
    id: `grid-${index}`,
    originRow: origin.originRow,
    originCol: origin.originCol,
  }))
}

/**
 * Preset topologies matching the reference layouts.
 * Origins are in global cell coordinates; center / first grid is index 0
 * where the layout has a natural hub.
 */
export const TOPOLOGIES: Record<TopologyId, TopologyDefinition> = {
  single: {
    id: 'single',
    label: 'Single grid',
    overlapBoxes: 1,
    nodes: [{ originRow: 0, originCol: 0 }],
  },

  /** Two grids sharing one 3×3 box (corner / diagonal link). */
  'two-grids-1-overlap': {
    id: 'two-grids-1-overlap',
    label: '2 grids · 1-box overlap',
    overlapBoxes: 1,
    nodes: [
      { originRow: 0, originCol: 0 },
      { originRow: 6, originCol: 6 },
    ],
  },

  /**
   * 6 grids, 1-box overlaps — diamond / chain layout.
   * Bounding box ≈ 21×27 cells.
   */
  'six-grids-1-overlap': {
    id: 'six-grids-1-overlap',
    label: '6 grids · 1-box overlap',
    overlapBoxes: 1,
    nodes: [
      { originRow: 6, originCol: 6 }, // center-left connector (generation hub)
      { originRow: 0, originCol: 0 }, // top-left
      { originRow: 12, originCol: 0 }, // bottom-left
      { originRow: 0, originCol: 12 }, // top-middle
      { originRow: 12, originCol: 12 }, // bottom-middle
      { originRow: 6, originCol: 18 }, // far-right
    ],
  },

  /**
   * 7 grids, 2-box overlaps — stepped honeycomb.
   * Vertical pitch is 6 (share one box-row of two adjacent boxes).
   * Bounding box ≈ 33×15 cells.
   */
  'seven-grids-2-overlap': {
    id: 'seven-grids-2-overlap',
    label: '7 grids · 2-box overlap',
    overlapBoxes: 2,
    nodes: [
      { originRow: 12, originCol: 6 }, // central hub
      { originRow: 0, originCol: 3 }, // top
      { originRow: 6, originCol: 3 }, // upper-left
      { originRow: 6, originCol: 6 }, // upper-right
      { originRow: 18, originCol: 6 }, // lower-left
      { originRow: 18, originCol: 9 }, // lower-right
      { originRow: 24, originCol: 9 }, // bottom
    ],
  },

  /**
   * 7 grids, 3-box (full band/stack) overlaps — plus / cross.
   * Vertical column of 3 + horizontal row of 5 sharing the center.
   */
  'seven-grids-3-overlap-cross': {
    id: 'seven-grids-3-overlap-cross',
    label: '7 grids · 3-box cross',
    overlapBoxes: 3,
    nodes: [
      { originRow: 6, originCol: 12 }, // center
      { originRow: 0, originCol: 12 }, // top
      { originRow: 12, originCol: 12 }, // bottom
      { originRow: 6, originCol: 0 }, // far-left
      { originRow: 6, originCol: 6 }, // left-middle
      { originRow: 6, originCol: 18 }, // right-middle
      { originRow: 6, originCol: 24 }, // far-right
    ],
  },

  /**
   * 7 grids, 3-box overlaps — I-shape with top and bottom wings.
   */
  'seven-grids-3-overlap-i': {
    id: 'seven-grids-3-overlap-i',
    label: '7 grids · 3-box I-shape',
    overlapBoxes: 3,
    nodes: [
      { originRow: 6, originCol: 6 }, // middle-center hub
      { originRow: 0, originCol: 6 }, // top-center
      { originRow: 12, originCol: 6 }, // bottom-center
      { originRow: 0, originCol: 0 }, // top-left
      { originRow: 0, originCol: 12 }, // top-right
      { originRow: 12, originCol: 0 }, // bottom-left
      { originRow: 12, originCol: 12 }, // bottom-right
    ],
  },
}

export const TOPOLOGY_IDS = Object.keys(TOPOLOGIES) as TopologyId[]

export function createGraphFromTopology(topologyId: TopologyId): OverlapGraph {
  const topology = TOPOLOGIES[topologyId]
  return createOverlapGraph(nodesFromOrigins(topology.nodes))
}

export function listTopologies(): TopologyDefinition[] {
  return TOPOLOGY_IDS.map((id) => TOPOLOGIES[id])
}
