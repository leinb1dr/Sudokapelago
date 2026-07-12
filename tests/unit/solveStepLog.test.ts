import { describe, expect, it, vi } from 'vitest'
import { boardFromString } from '../../src/sudoku/grid'
import { solveWithHumanTechniques } from '../../src/sudoku/humanSolver'
import {
  formatSolveStep,
  logHumanSolveResult,
} from '../../src/sudoku/solveStepLog'

const EASY_PUZZLE =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

describe('solve step log', () => {
  it('formats a step with summary and reasoning lines', () => {
    const result = solveWithHumanTechniques(boardFromString(EASY_PUZZLE), {
      difficulty: 'easy',
    })
    const firstStep = result.steps[0]

    expect(formatSolveStep(firstStep, 1)[0]).toMatch(/^Step 1: /)
    expect(formatSolveStep(firstStep, 1).slice(1).every((line) => line.startsWith('  '))).toBe(
      true,
    )
  })

  it('logs grouped solve output to the console', () => {
    const result = solveWithHumanTechniques(boardFromString(EASY_PUZZLE), {
      difficulty: 'easy',
    })
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})

    logHumanSolveResult(result, 'easy')

    expect(groupSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Sudokapelago] Human solve (easy)'),
    )
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^Step 1: /),
    )
    expect(groupEndSpy).toHaveBeenCalled()

    groupSpy.mockRestore()
    logSpy.mockRestore()
    groupEndSpy.mockRestore()
  })
})
