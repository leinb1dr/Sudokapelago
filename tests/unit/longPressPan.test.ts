import { describe, expect, it } from 'vitest'
import {
  exceedsMoveTolerance,
  LONG_PRESS_MOVE_TOLERANCE_PX,
  shouldStartImmediatePan,
} from '../../src/longPressPan'

describe('longPressPan helpers', () => {
  it('starts pan immediately off-cell or with Shift on a cell', () => {
    expect(shouldStartImmediatePan(false, false)).toBe(true)
    expect(shouldStartImmediatePan(false, true)).toBe(true)
    expect(shouldStartImmediatePan(true, true)).toBe(true)
    expect(shouldStartImmediatePan(true, false)).toBe(false)
  })

  it('detects movement past the long-press cancel tolerance', () => {
    expect(exceedsMoveTolerance(0, 0, 0, 0)).toBe(false)
    expect(
      exceedsMoveTolerance(0, 0, LONG_PRESS_MOVE_TOLERANCE_PX, 0),
    ).toBe(false)
    expect(
      exceedsMoveTolerance(10, 10, 10 + LONG_PRESS_MOVE_TOLERANCE_PX + 1, 10),
    ).toBe(true)
  })
})
