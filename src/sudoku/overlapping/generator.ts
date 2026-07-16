import { isSolvedBoard } from '../grid'
import {
  createSeededRandom,
  generateSolvedBoard,
  type RandomSource,
} from '../generator'
import type { CellValue, Difficulty, Digit } from '../types'
import { fillBoardWithOverlapConstraints } from './constrainedFill'
import {
  createEmptyGlobalBoard,
  mergeLocalSolution,
  overlapFixedCellsForGrid,
} from './globalBoard'
import { removeCluesFromOverlappingPuzzle } from './setter'
import { buildSpiralTopology } from './topology'
import type {
  ConstrainedFillRequest,
  ConstrainedFillResult,
  FixedOverlapCell,
  OverlapBoxes,
  OverlapTopology,
  OverlappingSudokuPuzzle,
} from './types'

export interface OverlappingGeneratorOptions {
  difficulty: Difficulty
  overlapBoxes: OverlapBoxes
  gridCount: number
  random?: RandomSource
  seed?: number
  /**
   * Optional async fill function (e.g. web worker). Defaults to synchronous
   * constrained fill on the main thread.
   */
  fillGrid?: (
    request: ConstrainedFillRequest,
  ) => Promise<ConstrainedFillResult>
  protectOverlaps?: boolean
}

function defaultSeed(random: RandomSource): number {
  return Math.floor(random() * 0x1_0000_0000)
}

/**
 * Generate a center grid first, then recursively attach neighboring grids.
 * Overlap cells from earlier grids stay static and their known solution values
 * are supplied to each subsequent fill.
 */
export async function createOverlappingSudokuPuzzle(
  options: OverlappingGeneratorOptions,
): Promise<OverlappingSudokuPuzzle> {
  const random = options.random ?? Math.random
  const topology = buildSpiralTopology(
    options.overlapBoxes,
    options.gridCount,
  )
  const baseSeed = options.seed ?? defaultSeed(random)
  const solution = createEmptyGlobalBoard()

  const center = topology.grids[0]!
  const centerBoard = generateSolvedBoard(createSeededRandom(baseSeed))
  if (!isSolvedBoard(centerBoard)) {
    throw new Error('Center grid generation failed.')
  }
  mergeLocalSolution(solution, center, centerBoard)

  const fillGrid =
    options.fillGrid ??
    (async (request: ConstrainedFillRequest) =>
      fillBoardWithOverlapConstraints(
        request.fixedCells,
        createSeededRandom(request.seed),
      ))

  // Spiral / BFS order: grids are already ordered by buildSpiralTopology.
  for (let index = 1; index < topology.grids.length; index += 1) {
    const grid = topology.grids[index]!
    const fixedCells = overlapFixedCellsForGrid(
      topology,
      grid,
      solution,
    ) as FixedOverlapCell[]

    if (fixedCells.length === 0) {
      throw new Error(`Grid ${grid.id} has no overlap constraints.`)
    }

    const result = await fillGrid({
      fixedCells,
      seed: baseSeed + grid.id * 997,
    })

    if (!result.ok || !result.board || !isSolvedBoard(result.board)) {
      throw new Error(
        `Failed to generate connecting grid ${grid.id} (${result.reason ?? 'unknown'}).`,
      )
    }

    // Ensure overlap digits match the known solution before merging.
    for (const { cell, digit } of fixedCells) {
      if (result.board[cell] !== digit) {
        throw new Error(
          `Overlap solution mismatch on grid ${grid.id} cell ${cell}.`,
        )
      }
    }

    mergeLocalSolution(solution, grid, result.board)
  }

  const { puzzle, attempts, clues } = removeCluesFromOverlappingPuzzle(
    topology,
    solution,
    {
      difficulty: options.difficulty,
      random,
      protectOverlaps: options.protectOverlaps,
    },
  )

  return {
    topology,
    puzzle,
    solution,
    difficulty: options.difficulty,
    attempts,
    clues,
    gridCount: options.gridCount,
    overlapBoxes: options.overlapBoxes,
  }
}

/** Synchronous helper for tests / single-threaded generation. */
export function createOverlappingSudokuPuzzleSync(
  options: Omit<OverlappingGeneratorOptions, 'fillGrid'>,
): OverlappingSudokuPuzzle {
  const random = options.random ?? Math.random
  const topology = buildSpiralTopology(
    options.overlapBoxes,
    options.gridCount,
  )
  const baseSeed = options.seed ?? defaultSeed(random)
  const solution = createEmptyGlobalBoard()

  const centerBoard = generateSolvedBoard(createSeededRandom(baseSeed))
  mergeLocalSolution(solution, topology.grids[0]!, centerBoard)

  for (let index = 1; index < topology.grids.length; index += 1) {
    const grid = topology.grids[index]!
    const fixedCells = overlapFixedCellsForGrid(topology, grid, solution)
    const result = fillBoardWithOverlapConstraints(
      fixedCells,
      createSeededRandom(baseSeed + grid.id * 997),
    )
    if (!result.ok || !result.board) {
      throw new Error(
        `Failed to generate connecting grid ${grid.id} (${result.reason ?? 'unknown'}).`,
      )
    }
    mergeLocalSolution(solution, grid, result.board)
  }

  const { puzzle, attempts, clues } = removeCluesFromOverlappingPuzzle(
    topology,
    solution,
    {
      difficulty: options.difficulty,
      random,
      protectOverlaps: options.protectOverlaps,
    },
  )

  return {
    topology,
    puzzle,
    solution,
    difficulty: options.difficulty,
    attempts,
    clues,
    gridCount: options.gridCount,
    overlapBoxes: options.overlapBoxes,
  }
}

export function extractOverlapDigits(
  board: readonly CellValue[],
  cells: readonly number[],
): FixedOverlapCell[] {
  return cells.map((cell) => ({
    cell,
    digit: board[cell] as Digit,
  }))
}

export type { OverlapTopology }
