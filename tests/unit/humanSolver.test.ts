import { describe, expect, it } from 'vitest'
import {
  boardFromString,
  maskHasDigit,
} from '../../src/sudoku/grid'
import { solveWithHumanTechniques } from '../../src/sudoku/humanSolver'
import {
  eliminateCandidate,
  resultFromCounts,
} from '../../src/sudoku/solverState'
import type { HumanTechnique } from '../../src/sudoku/types'

const EASY_PUZZLE =
  '530070000600195000098000060800060003400803001700020006060000280000419005000080079'
const SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179'

describe('human solver', () => {
  it('solves a standard puzzle with easy human techniques', () => {
    const result = solveWithHumanTechniques(boardFromString(EASY_PUZZLE), {
      difficulty: 'easy',
    })

    expect(result.solved).toBe(true)
    expect(result.reason).toBe('solved')
    expect(result.board).toEqual(boardFromString(SOLUTION))
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].details.summary).toMatch(/^(Cross Hatch|Hidden Single|Naked Single):/)
    expect(result.steps[0].details.reasoning.length).toBeGreaterThan(0)
  })

  it('restarts at the most advanced technique after every change', () => {
    const calls: string[] = []
    const advanced: HumanTechnique = {
      name: 'y-wing',
      apply(state) {
        calls.push('advanced')
        if (
          !maskHasDigit(state.candidates[0], 9) &&
          maskHasDigit(state.candidates[1], 9)
        ) {
          eliminateCandidate(state, 1, 9)
          return resultFromCounts(0, 1)
        }
        return resultFromCounts()
      },
    }
    const lower: HumanTechnique = {
      name: 'naked-single',
      apply(state) {
        calls.push('lower')
        const changed = eliminateCandidate(state, 0, 9)
        return resultFromCounts(0, Number(changed))
      },
    }

    const result = solveWithHumanTechniques(Array(81).fill(0), {
      difficulty: 'hard',
      techniques: [advanced, lower],
    })

    expect(result.reason).toBe('stalled')
    expect(calls).toEqual([
      'advanced',
      'lower',
      'advanced',
      'advanced',
      'lower',
    ])
    expect(result.steps.map(({ technique }) => technique)).toEqual([
      'naked-single',
      'y-wing',
    ])
  })

  it('reports duplicate givens as invalid', () => {
    const invalid = boardFromString(SOLUTION)
    invalid[0] = invalid[1]

    const result = solveWithHumanTechniques(invalid, {
      difficulty: 'expert',
    })

    expect(result.solved).toBe(false)
    expect(result.reason).toBe('invalid')
  })
})
