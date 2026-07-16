import { countClues } from '../grid'
import { createSeededRandom, shuffle, type RandomSource } from '../generator'
import { tryRemoveClue } from '../setter'
import type {
  CellValue,
  Difficulty,
  HumanTechnique,
  SudokuPuzzle,
} from '../types'
import { generateOverlappingSolutionAsync } from './asyncGenerator'
import {
  cellKey,
  findOverlapGlobalKeys,
  localToGlobal,
} from './coordinates'
import {
  cloneGlobalBoard,
  countGlobalClues,
  createEmptyGlobalBoard,
  readLocalBoard,
  writeLocalBoard,
} from './globalBoard'
import { generateOverlappingSolution } from './generator'
import { solveOverlappingWithHumanTechniques } from './solver'
import { createGraphFromTopology } from './topologies'
import type { ConstrainedFillFn } from './workerClient'
import type {
  ConstrainedGridRequest,
  ConstrainedGridResult,
  OverlapGraph,
  OverlapSetterAttempt,
  OverlappingSudokuPuzzle,
  TopologyId,
} from './types'

export interface OverlapSetterOptions {
  topologyId: TopologyId
  difficulty: Difficulty
  seed?: number
  random?: RandomSource
  techniques?: readonly HumanTechnique[]
  /**
   * When true (default), overlap cells are never removed as clues. This keeps
   * generation fast and avoids multi-solution bottlenecks at junctions.
   */
  protectOverlaps?: boolean
  fillGrid?: (request: ConstrainedGridRequest) => ConstrainedGridResult
  asyncFillGrid?: ConstrainedFillFn
  onAttempt?: (
    attempt: OverlapSetterAttempt,
    puzzle: OverlappingSudokuPuzzle['puzzle'],
  ) => void
}

export interface RemovalCandidate {
  gridId: string
  localCell: number
  row: number
  col: number
  isOverlap: boolean
}

/**
 * Build removal candidates with non-overlap cells first so outer regions are
 * stripped before structural bottleneck (overlap) clues.
 */
export function prioritizedRemovalOrder(
  graph: OverlapGraph,
  random: RandomSource,
  options: { includeOverlap: boolean } = { includeOverlap: true },
): RemovalCandidate[] {
  const overlapKeys = findOverlapGlobalKeys(graph.nodes)
  const seen = new Set<string>()
  const outer: RemovalCandidate[] = []
  const overlap: RemovalCandidate[] = []

  for (const node of graph.nodes) {
    for (let localCell = 0; localCell < 81; localCell += 1) {
      const { row, col } = localToGlobal(node, localCell)
      const key = cellKey(row, col)
      if (seen.has(key)) {
        continue
      }
      seen.add(key)

      const candidate: RemovalCandidate = {
        gridId: node.id,
        localCell,
        row,
        col,
        isOverlap: overlapKeys.has(key),
      }

      if (candidate.isOverlap) {
        if (options.includeOverlap) {
          overlap.push(candidate)
        }
      } else {
        outer.push(candidate)
      }
    }
  }

  return [...shuffle(outer, random), ...shuffle(overlap, random)]
}

function buildPerGridPuzzles(
  puzzle: OverlappingSudokuPuzzle['puzzle'],
  solution: OverlappingSudokuPuzzle['solution'],
  graph: OverlapGraph,
  difficulty: Difficulty,
): Record<string, SudokuPuzzle> {
  const result: Record<string, SudokuPuzzle> = {}

  for (const node of graph.nodes) {
    const localPuzzle = readLocalBoard(puzzle, graph, node.id)
    const localSolution = readLocalBoard(solution, graph, node.id)
    result[node.id] = {
      puzzle: localPuzzle,
      solution: localSolution,
      difficulty,
      attempts: [],
      clues: countClues(localPuzzle),
    }
  }

  return result
}

function finishPuzzleFromSolution(
  options: OverlapSetterOptions,
  graph: OverlapGraph,
  solution: OverlappingSudokuPuzzle['solution'],
  localSolutions: Record<string, CellValue[]>,
): OverlappingSudokuPuzzle {
  const seed = options.seed ?? 1
  const random = options.random ?? createSeededRandom(seed)
  const protectOverlaps = options.protectOverlaps ?? true
  const overlapKeys = findOverlapGlobalKeys(graph.nodes)

  const puzzle = cloneGlobalBoard(solution)
  const attempts: OverlapSetterAttempt[] = []

  const localPuzzles: Record<string, CellValue[]> = {}
  for (const node of graph.nodes) {
    localPuzzles[node.id] = [...localSolutions[node.id]]
  }

  const removalOrder = prioritizedRemovalOrder(graph, random, {
    includeOverlap: !protectOverlaps,
  })

  for (const candidate of removalOrder) {
    const localPuzzle = localPuzzles[candidate.gridId]
    const localSolution = localSolutions[candidate.gridId]
    const digit = localPuzzle[candidate.localCell]
    if (digit === 0) {
      continue
    }

    const attempt = tryRemoveClue(
      localPuzzle,
      localSolution,
      candidate.localCell,
      options,
    )

    const overlapAttempt: OverlapSetterAttempt = {
      ...attempt,
      gridId: candidate.gridId,
      isOverlap: candidate.isOverlap,
    }
    attempts.push(overlapAttempt)

    if (attempt.accepted) {
      writeLocalBoard(puzzle, graph, candidate.gridId, localPuzzle)
    }

    options.onAttempt?.(overlapAttempt, [...puzzle])
  }

  for (const node of graph.nodes) {
    localPuzzles[node.id] = readLocalBoard(puzzle, graph, node.id)
  }

  const verification = solveOverlappingWithHumanTechniques(
    puzzle,
    graph,
    options,
  )
  if (
    !verification.solved ||
    !verification.board.every((value, index) => value === solution[index])
  ) {
    throw new Error('The overlapping puzzle failed its final human-solve check.')
  }

  return {
    graph,
    topologyId: options.topologyId,
    puzzle,
    solution,
    difficulty: options.difficulty,
    gridPuzzles: buildPerGridPuzzles(
      puzzle,
      solution,
      graph,
      options.difficulty,
    ),
    attempts,
    clues: countGlobalClues(puzzle),
    overlapCellCount: overlapKeys.size,
  }
}

/**
 * Create an overlapping Sudoku with a unique human-solvable solution.
 *
 * Strategy (modular — reuses the standard per-grid remover):
 * 1. Generate the full overlapping solution (hub first, then constrained fills).
 * 2. For each grid, attempt clue removals with the standard `tryRemoveClue`,
 *    but skip (protect) overlap cells so junctions stay densely clued.
 * 3. Non-overlap cells are attempted before any optional overlap pass.
 * 4. Final verification runs the multi-grid human solver on the shared board.
 */
export function createOverlappingSudokuPuzzle(
  options: OverlapSetterOptions,
): OverlappingSudokuPuzzle {
  const seed = options.seed ?? 1
  const graph = createGraphFromTopology(options.topologyId)
  const { solution, localSolutions } = generateOverlappingSolution(
    graph,
    seed,
    options.fillGrid,
  )
  return finishPuzzleFromSolution(options, graph, solution, localSolutions)
}

/**
 * Async variant that generates connecting grids via workers when available.
 */
export async function createOverlappingSudokuPuzzleAsync(
  options: OverlapSetterOptions,
): Promise<OverlappingSudokuPuzzle> {
  const seed = options.seed ?? 1
  const graph = createGraphFromTopology(options.topologyId)
  const { solution, localSolutions } = await generateOverlappingSolutionAsync(
    graph,
    seed,
    options.asyncFillGrid,
  )
  return finishPuzzleFromSolution(options, graph, solution, localSolutions)
}

/** Empty global board helper re-exported for tests. */
export function emptyPuzzleBoard(graph: OverlapGraph): (CellValue | null)[] {
  return createEmptyGlobalBoard(graph)
}
