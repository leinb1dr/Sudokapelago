import { createSeededRandom, generateSolvedBoard } from '../generator'
import {
  createEmptyGlobalBoard,
  extractOverlapConstraints,
  writeLocalBoard,
} from './globalBoard'
import {
  generationOrder,
  solveConstrainedGrid,
  type OverlapSolutionResult,
} from './generator'
import type { ConstrainedFillFn } from './workerClient'
import type { OverlapGraph } from './types'

/**
 * Async generation that fans child fills through workers when provided.
 * Grids are BFS-layered so a node only starts after at least one neighbor has
 * contributed static overlap constraints; siblings in the same ready set run
 * concurrently via Promise.all.
 */
export async function generateOverlappingSolutionAsync(
  graph: OverlapGraph,
  seed = 1,
  fillGrid: ConstrainedFillFn = async (request) => solveConstrainedGrid(request),
): Promise<OverlapSolutionResult> {
  const globalSolution = createEmptyGlobalBoard(graph)
  const localSolutions: OverlapSolutionResult['localSolutions'] = {}
  const order = generationOrder(graph)

  if (order.length === 0) {
    return { solution: globalSolution, localSolutions }
  }

  const adjacency = new Map<string, string[]>()
  for (const node of graph.nodes) {
    adjacency.set(node.id, [])
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to)
    adjacency.get(edge.to)?.push(edge.from)
  }

  const hub = order[0]
  const hubBoard = generateSolvedBoard(createSeededRandom(seed))
  writeLocalBoard(globalSolution, graph, hub, hubBoard)
  localSolutions[hub] = hubBoard

  const completed = new Set<string>([hub])
  const pending = new Set(order.slice(1))
  let childSeed = seed + 1

  while (pending.size > 0) {
    const ready: string[] = []
    for (const gridId of pending) {
      const neighbors = adjacency.get(gridId) ?? []
      const hasCompletedNeighbor = neighbors.some((neighbor) =>
        completed.has(neighbor),
      )
      if (hasCompletedNeighbor || neighbors.length === 0) {
        ready.push(gridId)
      }
    }

    if (ready.length === 0) {
      ready.push([...pending][0])
    }

    // Snapshot constraints before the concurrent layer so siblings share the
    // same static parent state (no cross-talk mid-layer).
    const layerRequests = ready.map((gridId) => {
      const seedForGrid = childSeed
      childSeed += 1
      const constraints = extractOverlapConstraints(
        globalSolution,
        graph,
        gridId,
      )
      return {
        gridId,
        promise: fillGrid({
          givens: constraints.givens,
          knownSolution: constraints.knownSolution,
          seed: seedForGrid,
        }),
      }
    })

    const settled = await Promise.all(
      layerRequests.map(async ({ gridId, promise }) => ({
        gridId,
        result: await promise,
      })),
    )

    for (const { gridId, result } of settled) {
      if (!result.ok || !result.board) {
        throw new Error(
          `Failed to generate overlapping grid "${gridId}": ${result.reason ?? 'unknown'}`,
        )
      }
      writeLocalBoard(globalSolution, graph, gridId, result.board)
      localSolutions[gridId] = result.board
      completed.add(gridId)
      pending.delete(gridId)
    }
  }

  return { solution: globalSolution, localSolutions }
}
