import { describe, expect, it } from 'vitest'
import { isSolvedBoard, isValidBoard } from '../../src/sudoku/grid'
import { createSeededRandom } from '../../src/sudoku/generator'
import {
  createGraphFromTopology,
  createOverlapGraph,
  createOverlappingSudokuPuzzle,
  findOverlapGlobalKeys,
  generateOverlappingSolution,
  generationOrder,
  localToGlobal,
  prioritizedRemovalOrder,
  readLocalBoard,
  sharedCellsBetween,
  solveOverlappingWithHumanTechniques,
} from '../../src/sudoku/overlap'
import { fillBoardWithConstraints } from '../../src/sudoku/overlap/constrainedFill'
import { placementMatchesKnownOverlap } from '../../src/sudoku/overlap/solver'

describe('overlap coordinates and graph', () => {
  it('maps local cells into a shared global coordinate space', () => {
    const graph = createOverlapGraph([
      { id: 'a', originRow: 0, originCol: 0 },
      { id: 'b', originRow: 6, originCol: 6 },
    ])

    expect(graph.bounds).toEqual({ minRow: 0, minCol: 0, rows: 15, cols: 15 })
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0].overlapBoxes).toBe(1)
    expect(graph.edges[0].sharedCells).toHaveLength(9)

    const shared = sharedCellsBetween(graph.nodes[0], graph.nodes[1])
    expect(shared).not.toBeNull()
    const first = localToGlobal(graph.nodes[0], shared!.sharedCells[0])
    const secondLocal = shared!.toSharedCells[0]
    const second = localToGlobal(graph.nodes[1], secondLocal)
    expect(first).toEqual(second)
  })

  it('rejects more than 10 grids', () => {
    const nodes = Array.from({ length: 11 }, (_, index) => ({
      id: `g${index}`,
      originRow: 0,
      originCol: index * 12,
    }))
    expect(() => createOverlapGraph(nodes)).toThrow(/at most 10/)
  })

  it('builds preset topologies with expected overlap counts', () => {
    const two = createGraphFromTopology('two-grids-1-overlap')
    expect(two.nodes).toHaveLength(2)
    expect(findOverlapGlobalKeys(two.nodes).size).toBe(9)

    const six = createGraphFromTopology('six-grids-1-overlap')
    expect(six.nodes).toHaveLength(6)
    expect(six.edges.length).toBeGreaterThan(0)

    const cross = createGraphFromTopology('seven-grids-3-overlap-cross')
    expect(cross.nodes).toHaveLength(7)
    expect(cross.edges.some((edge) => edge.overlapBoxes === 3)).toBe(true)
    // Corner touches between wing grids may create 1-box edges as well.
    expect(cross.edges.length).toBeGreaterThanOrEqual(6)
  })
})

describe('constrained fill with known overlap solution', () => {
  it('rejects placements that conflict with known overlap digits', () => {
    const givens = Array.from({ length: 81 }, () => 0)
    const known = Array.from({ length: 81 }, () => 0)
    known[0] = 5
    givens[0] = 5

    const filled = fillBoardWithConstraints(
      givens,
      known,
      createSeededRandom(11),
    )
    expect(filled).not.toBeNull()
    expect(filled![0]).toBe(5)
    expect(isSolvedBoard(filled!)).toBe(true)
  })

  it('returns null when givens contradict the known solution', () => {
    const givens = Array.from({ length: 81 }, () => 0)
    const known = Array.from({ length: 81 }, () => 0)
    givens[0] = 1
    known[0] = 2
    expect(
      fillBoardWithConstraints(givens, known, createSeededRandom(3)),
    ).toBeNull()
  })

  it('treats a conflicting placement as invalid via the overlap check helper', () => {
    const known = Array.from({ length: 81 }, () => 0)
    known[10] = 7
    expect(placementMatchesKnownOverlap(10, 7, known)).toBe(true)
    expect(placementMatchesKnownOverlap(10, 3, known)).toBe(false)
    expect(placementMatchesKnownOverlap(11, 3, known)).toBe(true)
  })
})

describe('overlapping generation and setter', () => {
  it('generates a hub-first solution with consistent overlap cells', () => {
    const graph = createGraphFromTopology('two-grids-1-overlap')
    const { solution, localSolutions } = generateOverlappingSolution(
      graph,
      42,
    )

    expect(generationOrder(graph)[0]).toBe(graph.nodes[0].id)
    expect(Object.keys(localSolutions)).toHaveLength(2)

    for (const node of graph.nodes) {
      const local = readLocalBoard(solution, graph, node.id)
      expect(isSolvedBoard(local)).toBe(true)
      expect(isValidBoard(local)).toBe(true)
    }

    const left = readLocalBoard(solution, graph, 'grid-0')
    const right = readLocalBoard(solution, graph, 'grid-1')
    // Shared box: left bottom-right (rows 6-8, cols 6-8) == right top-left.
    for (let row = 6; row < 9; row += 1) {
      for (let col = 6; col < 9; col += 1) {
        const leftCell = row * 9 + col
        const rightCell = (row - 6) * 9 + (col - 6)
        expect(left[leftCell]).toBe(right[rightCell])
      }
    }
  })

  it('prioritizes non-overlap cells before overlap cells during clue removal', () => {
    const graph = createGraphFromTopology('two-grids-1-overlap')
    const order = prioritizedRemovalOrder(graph, createSeededRandom(5), {
      includeOverlap: true,
    })
    const firstOverlap = order.findIndex((candidate) => candidate.isOverlap)
    expect(firstOverlap).toBeGreaterThan(0)
    expect(order.slice(0, firstOverlap).every((c) => !c.isOverlap)).toBe(true)
    expect(order.slice(firstOverlap).every((c) => c.isOverlap)).toBe(true)
  })

  it('creates a uniquely human-solvable two-grid puzzle while protecting overlaps', () => {
    const puzzle = createOverlappingSudokuPuzzle({
      topologyId: 'two-grids-1-overlap',
      difficulty: 'easy',
      seed: 2026,
      protectOverlaps: true,
    })

    expect(puzzle.graph.nodes).toHaveLength(2)
    expect(puzzle.overlapCellCount).toBe(9)
    expect(puzzle.attempts.every((attempt) => !attempt.isOverlap)).toBe(true)
    expect(puzzle.clues).toBeGreaterThan(puzzle.overlapCellCount)

    const solved = solveOverlappingWithHumanTechniques(
      puzzle.puzzle,
      puzzle.graph,
      { difficulty: 'easy' },
    )
    expect(solved.solved).toBe(true)
    expect(solved.board).toEqual(puzzle.solution)
  })

  it('keeps the single-grid topology compatible with standard play data', () => {
    const puzzle = createOverlappingSudokuPuzzle({
      topologyId: 'single',
      difficulty: 'easy',
      seed: 99,
    })
    expect(puzzle.graph.nodes).toHaveLength(1)
    expect(puzzle.overlapCellCount).toBe(0)
    const local = readLocalBoard(puzzle.puzzle, puzzle.graph, 'grid-0')
    expect(local).toHaveLength(81)
  })
})
