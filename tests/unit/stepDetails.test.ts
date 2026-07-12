import { describe, expect, it } from 'vitest'
import { boardFromString } from '../../src/sudoku/grid'
import { createSolverState } from '../../src/sudoku/solverState'
import {
  buildCrossHatchDetails,
  buildDetailsFromDiff,
  buildNakedSingleDetails,
  formatCell,
} from '../../src/sudoku/stepDetails'
import { applyNakedSingles } from '../../src/sudoku/techniques/easy'

describe('step details', () => {
  it('formats cells with 1-based coordinates', () => {
    expect(formatCell(0)).toBe('r1 c1')
    expect(formatCell(10)).toBe('r2 c2')
  })

  it('describes naked singles with peer blocks', () => {
    const state = createSolverState(boardFromString('.'.repeat(81)))
    state.board[1] = 4
    state.candidates[0] = 1 << 7

    const details = buildNakedSingleDetails(state, 0, 7)

    expect(details.summary).toBe('Naked Single: r1 c1 set 7')
    expect(details.reasoning.join('\n')).toContain('Checking r1 c1 for naked single.')
    expect(details.reasoning.join('\n')).toContain('r1 c2 has 4')
    expect(details.reasoning.join('\n')).toContain('Only option left is 7.')
  })

  it('describes cross-hatching with candidate context', () => {
    const details = buildCrossHatchDetails(1, 6, 10, [10, 12])

    expect(details.summary).toBe('Cross Hatch: r2 c2 set 6')
    expect(details.reasoning.join('\n')).toContain('Cross-hatching box 2 for digit 6.')
    expect(details.reasoning.join('\n')).toContain('Candidate cells: r2 c2, r2 c4.')
  })

  it('builds diff details when a technique omits custom logging', () => {
    const before = createSolverState(boardFromString('.'.repeat(81)))
    before.candidates[0] = (1 << 5) | (1 << 9)
    const after = createSolverState(boardFromString('.'.repeat(81)))
    after.candidates[0] = 1 << 5

    const details = buildDetailsFromDiff(before, after, 'naked-pair')

    expect(details.summary).toContain('Naked Pair')
    expect(details.reasoning.join('\n')).toContain('r1 c1 ≠ 9')
  })

  it('returns rich details from easy techniques', () => {
    const state = createSolverState(boardFromString('.'.repeat(81)))
    state.candidates[0] = 1 << 5

    const result = applyNakedSingles(state)

    expect(result.details?.summary).toBe('Naked Single: r1 c1 set 5')
    expect(result.details?.reasoning.length).toBeGreaterThan(0)
  })
})
