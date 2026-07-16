import { describe, expect, it } from 'vitest'
import { boardsEqual, isSolvedBoard } from '../../src/sudoku/grid'
import { createSeededRandom } from '../../src/sudoku/generator'
import { solveWithHumanTechniques } from '../../src/sudoku/humanSolver'
import {
  createOverlappingSudokuPuzzleSync,
  extractLocalBoard,
  getOverlapGlobalKeys,
  getUniqueGlobalCellCount,
  pointKey,
} from '../../src/sudoku/overlapping'

describe('overlapping puzzle generation and clue removal', () => {
  it('generates a 2-grid 1-box puzzle with a unique human-solvable solution', () => {
    const generated = createOverlappingSudokuPuzzleSync({
      difficulty: 'easy',
      overlapBoxes: 1,
      gridCount: 2,
      seed: 2026,
      random: createSeededRandom(2026),
    })

    expect(generated.topology.grids).toHaveLength(2)
    expect(generated.topology.edges).toHaveLength(1)
    expect(generated.clues).toBeGreaterThan(0)
    expect(generated.clues).toBeLessThan(getUniqueGlobalCellCount(generated.topology))

    for (const grid of generated.topology.grids) {
      const localPuzzle = extractLocalBoard(generated.puzzle, grid)
      const localSolution = extractLocalBoard(generated.solution, grid)
      expect(isSolvedBoard(localSolution)).toBe(true)

      const solved = solveWithHumanTechniques(localPuzzle, {
        difficulty: 'easy',
      })
      expect(solved.solved).toBe(true)
      expect(boardsEqual(solved.board, localSolution)).toBe(true)
    }
  })

  it('protects overlapping regions by attempting outer cells first', () => {
    const generated = createOverlappingSudokuPuzzleSync({
      difficulty: 'easy',
      overlapBoxes: 1,
      gridCount: 2,
      seed: 42,
      random: createSeededRandom(42),
      protectOverlaps: true,
    })

    const overlapKeys = getOverlapGlobalKeys(generated.topology)
    let overlapClues = 0
    let nonOverlapClues = 0
    let overlapCells = 0
    let nonOverlapCells = 0
    const seen = new Set<string>()

    for (const grid of generated.topology.grids) {
      for (let row = 0; row < 9; row += 1) {
        for (let column = 0; column < 9; column += 1) {
          const key = pointKey(grid.origin.x + column, grid.origin.y + row)
          if (seen.has(key)) {
            continue
          }
          seen.add(key)
          const value = generated.puzzle.get(key) ?? 0
          if (overlapKeys.has(key)) {
            overlapCells += 1
            overlapClues += Number(value !== 0)
          } else {
            nonOverlapCells += 1
            nonOverlapClues += Number(value !== 0)
          }
        }
      }
    }

    expect(overlapCells).toBe(9)
    expect(nonOverlapCells).toBeGreaterThan(overlapCells)

    const overlapDensity = overlapClues / overlapCells
    const outerDensity = nonOverlapClues / nonOverlapCells
    expect(overlapDensity).toBeGreaterThanOrEqual(outerDensity)
  })

  it('keeps standard single-board generation path available separately', async () => {
    // Sanity: overlapping module must not be required for standard puzzles.
    const { createSudokuPuzzle } = await import('../../src/sudoku/setter')
    const puzzle = createSudokuPuzzle({
      difficulty: 'easy',
      random: createSeededRandom(7),
    })
    expect(puzzle.puzzle).toHaveLength(81)
    expect(puzzle.solution).toHaveLength(81)
  })
})
