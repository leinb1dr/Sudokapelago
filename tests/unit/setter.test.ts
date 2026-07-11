import { describe, expect, it } from 'vitest'
import {
  boardFromString,
  boardsEqual,
  countClues,
  isSolvedBoard,
  isValidBoard,
} from '../../src/sudoku/grid'
import { createSeededRandom } from '../../src/sudoku/generator'
import { solveWithHumanTechniques } from '../../src/sudoku/humanSolver'
import {
  createSudokuPuzzle,
  tryRemoveClue,
} from '../../src/sudoku/setter'
import { DIFFICULTIES } from '../../src/sudoku/types'

const SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179'

describe('two-phase Sudoku setter', () => {
  it('tries every cell once and retains only human-solvable removals', () => {
    const observedCells: number[] = []
    const generated = createSudokuPuzzle({
      difficulty: 'easy',
      random: createSeededRandom(2026),
      onAttempt(attempt, currentPuzzle) {
        observedCells.push(attempt.cell)
        expect(currentPuzzle[attempt.cell] === 0).toBe(attempt.accepted)
      },
    })

    expect(isSolvedBoard(generated.solution)).toBe(true)
    expect(isValidBoard(generated.puzzle)).toBe(true)
    expect(generated.attempts).toHaveLength(81)
    expect(new Set(observedCells).size).toBe(81)
    expect(generated.clues).toBe(countClues(generated.puzzle))
    expect(
      generated.attempts.filter(({ accepted }) => accepted),
    ).toHaveLength(81 - generated.clues)

    const solveResult = solveWithHumanTechniques(generated.puzzle, {
      difficulty: 'easy',
    })
    expect(solveResult.solved).toBe(true)
    expect(boardsEqual(solveResult.board, generated.solution)).toBe(true)
  })

  it('restores a clue when the configured techniques cannot solve', () => {
    const puzzle = boardFromString(SOLUTION)
    const attempt = tryRemoveClue(puzzle, boardFromString(SOLUTION), 0, {
      difficulty: 'easy',
      techniques: [],
    })

    expect(attempt.accepted).toBe(false)
    expect(puzzle[0]).toBe(5)
  })

  it('keeps a clue removed when the configured solver reaches the solution', () => {
    const puzzle = boardFromString(SOLUTION)
    const attempt = tryRemoveClue(puzzle, boardFromString(SOLUTION), 0, {
      difficulty: 'easy',
    })

    expect(attempt.accepted).toBe(true)
    expect(puzzle[0]).toBe(0)
    expect(attempt.solveSteps).toBeGreaterThan(0)
  })

  it.each(DIFFICULTIES)(
    'produces a puzzle independently solvable at %s difficulty',
    (difficulty) => {
      const generated = createSudokuPuzzle({
        difficulty,
        random: createSeededRandom(DIFFICULTIES.indexOf(difficulty) + 90),
      })
      const solved = solveWithHumanTechniques(generated.puzzle, {
        difficulty,
      })

      expect(solved.solved).toBe(true)
      expect(solved.board).toEqual(generated.solution)
    },
  )
})
