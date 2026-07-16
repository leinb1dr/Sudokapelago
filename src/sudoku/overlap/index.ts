export type {
  BoundingBox,
  ConstrainedGridRequest,
  ConstrainedGridResult,
  GlobalBoard,
  GlobalCellCoord,
  GridId,
  GridNode,
  OverlapBoxes,
  OverlapEdge,
  OverlapGraph,
  OverlapSetterAttempt,
  OverlappingSudokuPuzzle,
  TopologyDefinition,
  TopologyId,
} from './types'

export {
  buildEdges,
  buildGlobalOccupancy,
  cellKey,
  computeBounds,
  createOverlapGraph,
  findOverlapGlobalKeys,
  getNode,
  globalIndex,
  globalToLocal,
  indexToGlobal,
  isOverlapLocalCell,
  localToGlobal,
  overlapBoxesFromSharedCount,
  sharedCellsBetween,
} from './coordinates'

export {
  TOPOLOGIES,
  TOPOLOGY_IDS,
  createGraphFromTopology,
  listTopologies,
} from './topologies'

export { fillBoardWithConstraints } from './constrainedFill'

export {
  cloneGlobalBoard,
  countGlobalClues,
  createEmptyGlobalBoard,
  createPresenceMask,
  extractOverlapConstraints,
  getGlobalCell,
  gridsContaining,
  iterPresentCells,
  readLocalBoard,
  setGlobalCell,
  writeLocalBoard,
} from './globalBoard'

export {
  generateOverlappingSolution,
  generationOrder,
  solveConstrainedGrid,
} from './generator'
export type { OverlapSolutionResult } from './generator'

export { generateOverlappingSolutionAsync } from './asyncGenerator'

export {
  placementMatchesKnownOverlap,
  solveOverlappingWithHumanTechniques,
} from './solver'

export {
  createOverlappingSudokuPuzzle,
  createOverlappingSudokuPuzzleAsync,
  prioritizedRemovalOrder,
} from './setter'

export {
  createWorkerFillFn,
  fillWithOptionalWorker,
} from './workerClient'
export type { ConstrainedFillFn } from './workerClient'
