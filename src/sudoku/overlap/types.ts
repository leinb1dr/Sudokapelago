import type {
  CellValue,
  Difficulty,
  SetterAttempt,
  SudokuPuzzle,
} from '../types'

/** Number of 3×3 boxes shared by an overlap edge. */
export type OverlapBoxes = 1 | 2 | 3

export type GridId = string

/** A 9×9 grid anchored in global cell coordinates. */
export interface GridNode {
  id: GridId
  /** Global row of this grid's local cell (0,0). */
  originRow: number
  /** Global column of this grid's local cell (0,0). */
  originCol: number
}

export interface GlobalCellCoord {
  row: number
  col: number
}

/**
 * An undirected overlap between two grids.
 * `sharedCells` lists local cell indexes (0–80) on `from` that map to the
 * same global cells as the corresponding entries in `toSharedCells`.
 */
export interface OverlapEdge {
  from: GridId
  to: GridId
  overlapBoxes: OverlapBoxes
  sharedCells: readonly number[]
  toSharedCells: readonly number[]
}

export interface BoundingBox {
  minRow: number
  minCol: number
  rows: number
  cols: number
}

export interface OverlapGraph {
  nodes: readonly GridNode[]
  edges: readonly OverlapEdge[]
  bounds: BoundingBox
}

export type TopologyId =
  | 'single'
  | 'two-grids-1-overlap'
  | 'six-grids-1-overlap'
  | 'seven-grids-2-overlap'
  | 'seven-grids-3-overlap-cross'
  | 'seven-grids-3-overlap-i'

export interface TopologyDefinition {
  id: TopologyId
  label: string
  overlapBoxes: OverlapBoxes
  /** Grid origins in global cell coordinates (center-first ordering preferred). */
  nodes: readonly Omit<GridNode, 'id'>[]
}

/** Sparse-capable dense global board: `null` marks holes outside any grid. */
export type GlobalBoard = readonly (CellValue | null)[]

export interface OverlappingSudokuPuzzle {
  graph: OverlapGraph
  topologyId: TopologyId
  /** Dense board covering `graph.bounds` (`null` = hole). */
  puzzle: GlobalBoard
  solution: GlobalBoard
  difficulty: Difficulty
  /** Per-grid setter metadata for debugging / summaries. */
  gridPuzzles: Readonly<Record<GridId, SudokuPuzzle>>
  attempts: readonly OverlapSetterAttempt[]
  clues: number
  overlapCellCount: number
}

export interface OverlapSetterAttempt extends SetterAttempt {
  gridId: GridId
  /** True when the removed cell belongs to at least two grids. */
  isOverlap: boolean
}

export interface ConstrainedGridRequest {
  /** Local 81-cell board with 0 for unknowns; overlap cells pre-filled. */
  givens: readonly CellValue[]
  /**
   * Known solution digits for overlap (and any other locked) cells.
   * Empty cells use 0. Used as an extra validation constraint while filling.
   */
  knownSolution: readonly CellValue[]
  seed: number
}

export interface ConstrainedGridResult {
  ok: boolean
  board: CellValue[] | null
  reason?: string
}
