import { describe, expect, it } from 'vitest'
import {
  TECHNIQUE_TIERS,
  getTechniquesForDifficulty,
} from '../../src/sudoku/techniques'

describe('technique registry', () => {
  it('keeps each tier independently reconfigurable', () => {
    expect(TECHNIQUE_TIERS.easy.map(({ name }) => name)).toEqual([
      'cross-hatching',
      'hidden-single',
      'naked-single',
    ])
    expect(TECHNIQUE_TIERS.expert.map(({ name }) => name)).toEqual([
      'swordfish',
    ])
  })

  it('runs the most advanced tier first and then falls through', () => {
    expect(
      getTechniquesForDifficulty('hard').map(({ name }) => name),
    ).toEqual([
      'y-wing',
      'x-wing',
      'hidden-triple',
      'hidden-pair',
      'naked-triple',
      'naked-pair',
      'locked-candidates',
      'pointing-pairs-triples',
      'cross-hatching',
      'hidden-single',
      'naked-single',
    ])
    expect(getTechniquesForDifficulty('expert')[0]?.name).toBe('swordfish')
  })
})
