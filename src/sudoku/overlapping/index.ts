export type {
  OverlapBoxes,
  GlobalPoint,
  GridId,
  GridNode,
  OverlapEdge,
  OverlapTopology,
  GlobalBoard,
  OverlappingSudokuPuzzle,
  FixedOverlapCell,
  ConstrainedFillRequest,
  ConstrainedFillResult,
} from './types'

export {
  pointKey,
  parsePointKey,
  localToGlobal,
  globalToLocal,
  listAttachmentCandidates,
  computeSharedGlobalCells,
  sharedCellCountForOverlap,
  isExactOverlap,
  lateralOffsetForOverlap,
} from './coordinates'

export {
  MAX_OVERLAPPING_GRIDS,
  buildSpiralTopology,
  createOneBoxSixGridTopology,
  createTwoBoxSevenGridTopology,
  createThreeBoxSevenGridTopology,
  getOverlapGlobalKeys,
  getUniqueGlobalCellCount,
  canPlaceGrid,
} from './topology'

export {
  fillBoardWithOverlapConstraints,
  isPlacementValidForOverlap,
  boardRespectsOverlapSolution,
} from './constrainedFill'

export {
  createEmptyGlobalBoard,
  extractLocalBoard,
  writeLocalBoard,
  mergeLocalSolution,
  getGlobalCell,
  setGlobalCell,
  cloneGlobalBoard,
  countGlobalClues,
  listUniqueGlobalPoints,
  overlapFixedCellsForGrid,
} from './globalBoard'

export {
  solveWithOverlapValidation,
  tryRemoveClueWithOverlapGuard,
} from './overlapSolver'

export {
  removeCluesFromOverlappingPuzzle,
  solveOverlappingPuzzle,
} from './setter'

export {
  createOverlappingSudokuPuzzle,
  createOverlappingSudokuPuzzleSync,
} from './generator'

export { createWorkerFillGrid } from './workerClient'

export {
  buildActiveCellKeySet,
  findNextActiveCell,
  getBoardOutlineRect,
  getUnifiedCellBorders,
  gridsContainingPoint,
  isActiveGlobalCell,
} from './unifiedGrid'
