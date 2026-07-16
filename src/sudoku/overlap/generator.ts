import { createSeededRandom, generateSolvedBoard } from '../generator'
import type { CellValue } from '../types'
import { fillBoardWithConstraints } from './constrainedFill'
import {
  createEmptyGlobalBoard,
  extractOverlapConstraints,
  writeLocalBoard,
} from './globalBoard'
import type {
  ConstrainedGridRequest,
  ConstrainedGridResult,
  OverlapGraph,
} from './types'

export function solveConstrainedGrid(
  request: ConstrainedGridRequest,
): ConstrainedGridResult {
  const random = createSeededRandom(request.seed)
  const board = fillBoardWithConstraints(
    request.givens,
    request.knownSolution,
    random,
  )

  if (!board) {
    return { ok: false, board: null, reason: 'no-solution' }
  }

  return { ok: true, board }
}

/**
 * Breadth-first generation order starting at the hub (first node).
 * Neighbors are discovered via overlap edges.
 */
export function generationOrder(graph: OverlapGraph): string[] {
  if (graph.nodes.length === 0) {
    return []
  }

  const adjacency = new Map<string, string[]>()
  for (const node of graph.nodes) {
    adjacency.set(node.id, [])
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to)
    adjacency.get(edge.to)?.push(edge.from)
  }

  const hub = graph.nodes[0].id
  const order: string[] = []
  const seen = new Set<string>([hub])
  const queue = [hub]

  while (queue.length > 0) {
    const current = queue.shift()
    if (current === undefined) {
      break
    }
    order.push(current)
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  for (const node of graph.nodes) {
    if (!seen.has(node.id)) {
      order.push(node.id)
    }
  }

  return order
}

export interface OverlapSolutionResult {
  solution: (CellValue | null)[]
  localSolutions: Record<string, CellValue[]>
}

/**
 * Generate a full overlapping solution.
 * Hub grid uses the standard unconstrained generator; each subsequent grid is
 * filled with static overlap constraints from already-generated neighbors.
 */
export function generateOverlappingSolution(
  graph: OverlapGraph,
  seed = 1,
  fillGrid: (request: ConstrainedGridRequest) => ConstrainedGridResult = solveConstrainedGrid,
): OverlapSolutionResult {
  const globalSolution = createEmptyGlobalBoard(graph)
  const localSolutions: Record<string, CellValue[]> = {}
  const order = generationOrder(graph)
  let childSeed = seed + 1

  for (const gridId of order) {
    let local: CellValue[]

    if (gridId === order[0]) {
      local = generateSolvedBoard(createSeededRandom(seed))
    } else {
      const constraints = extractOverlapConstraints(
        globalSolution,
        graph,
        gridId,
      )
      const result = fillGrid({
        givens: constraints.givens,
        knownSolution: constraints.knownSolution,
        seed: childSeed,
      })
      childSeed += 1

      if (!result.ok || !result.board) {
        throw new Error(
          `Failed to generate overlapping grid "${gridId}": ${result.reason ?? 'unknown'}`,
        )
      }
      local = result.board
    }

    writeLocalBoard(globalSolution, graph, gridId, local)
    localSolutions[gridId] = local
  }

  return { solution: globalSolution, localSolutions }
}
