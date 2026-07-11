import { describe, expect, it } from 'vitest'
import {
  DIFFICULTIES,
  TECHNIQUE_NAMES,
} from '../../src/sudoku/types'

describe('Sudoku domain types', () => {
  it('publishes every supported difficulty in ascending order', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard', 'expert'])
  })

  it('publishes a stable name for every requested human technique', () => {
    expect(TECHNIQUE_NAMES).toHaveLength(12)
    expect(TECHNIQUE_NAMES).toContain('cross-hatching')
    expect(TECHNIQUE_NAMES).toContain('y-wing')
    expect(TECHNIQUE_NAMES).toContain('swordfish')
  })
})
