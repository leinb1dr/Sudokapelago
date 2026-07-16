import type { CellValue, Difficulty, Digit, SetterAttempt } from '../types'

/** Number of 3×3 boxes shared along a connection (1, 2, or 3). */
export type OverlapBoxes = 1 | 2 | 3

export type GlobalPoint = Readonly<{ x: number; y: number }>

export type GridId = number

/** A 9×9 Sudoku board placed in global cell coordinates. */
export interface GridNode {
  id: GridId
  /** Top-left cell of this grid in the global coordinate space. */
  origin: GlobalPoint
}

/**
 * An undirected edge between two grids. The overlap is always a rectangular
 * block of `overlapBoxes` adjacent 3×3 boxes (9 cells each).
 */
export interface OverlapEdge {
  from: GridId
  to: GridId
  overlapBoxes: OverlapBoxes
  /** Global cells that belong to both grids, in row-major order. */
  sharedGlobalCells: readonly GlobalPoint[]
}

export interface OverlapTopology {
  overlapBoxes: OverlapBoxes
  grids: readonly GridNode[]
  edges: readonly OverlapEdge[]
  /** Inclusive bounding box in global cell coordinates. */
  bounds: Readonly<{
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  }>
}

/** Sparse global board keyed by `"x,y"`. */
export type GlobalBoard = Map<string, CellValue>

export interface OverlappingSudokuPuzzle {
  topology: OverlapTopology
  /** Puzzle clues in global coordinates (0 = empty). */
  puzzle: GlobalBoard
  /** Full solution in global coordinates. */
  solution: GlobalBoard
  difficulty: Difficulty
  attempts: SetterAttempt[]
  clues: number
  gridCount: number
  overlapBoxes: OverlapBoxes
}

export interface FixedOverlapCell {
  cell: number
  digit: Digit
}

export interface ConstrainedFillRequest {
  /** Fixed local 9×9 cell indexes with known solution digits (overlap). */
  fixedCells: readonly FixedOverlapCell[]
  seed: number
}

export interface ConstrainedFillResult {
  ok: boolean
  board: CellValue[] | null
  reason?: 'unsolvable' | 'overlap-conflict'
}
