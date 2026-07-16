import { describe, expect, it } from 'vitest'
import {
  cellContentRect,
  getVisibleContentRect,
  transformToShowRect,
} from '../../src/puzzleViewportMath'

describe('puzzleViewportMath', () => {
  it('computes the visible content rect from transform and viewport size', () => {
    const visible = getVisibleContentRect(
      { scale: 1, translateX: 0, translateY: 0 },
      400,
      400,
      200,
      200,
    )

    expect(visible).toEqual({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
    })
  })

  it('maps a global cell to content coordinates', () => {
    expect(cellContentRect(3, 5, 0, 0, 36)).toEqual({
      left: 108,
      top: 180,
      width: 36,
      height: 36,
    })
    expect(cellContentRect(3, 5, 2, 1, 36)).toEqual({
      left: 36,
      top: 144,
      width: 36,
      height: 36,
    })
  })

  it('returns the same transform when the cell is already fully visible', () => {
    const transform = { scale: 1, translateX: 0, translateY: 0 }
    const next = transformToShowRect(
      transform,
      400,
      400,
      200,
      200,
      { left: 120, top: 120, width: 36, height: 36 },
      0,
    )
    expect(next).toBe(transform)
  })

  it('pans right/down when the cell is past the bottom-right edge', () => {
    const transform = { scale: 1, translateX: 0, translateY: 0 }
    // Visible is [100,100]–[300,300]. Cell near bottom-right of content.
    const next = transformToShowRect(
      transform,
      400,
      400,
      200,
      200,
      { left: 350, top: 350, width: 36, height: 36 },
      0,
    )

    expect(next).not.toBe(transform)
    expect(next.scale).toBe(1)
    // Cell right edge 386 → visible left should become 186
    // translateX = 200 - 186 - 100 = -86
    expect(next.translateX).toBeCloseTo(-86)
    expect(next.translateY).toBeCloseTo(-86)

    const visible = getVisibleContentRect(next, 400, 400, 200, 200)
    expect(visible.left + visible.width).toBeGreaterThanOrEqual(386)
    expect(visible.top + visible.height).toBeGreaterThanOrEqual(386)
  })

  it('pans left/up when the cell is past the top-left edge', () => {
    const transform = { scale: 1, translateX: -100, translateY: -100 }
    // With this translate, visible left = 200 - (-100) - 100 = 200
    const visibleBefore = getVisibleContentRect(transform, 400, 400, 200, 200)
    expect(visibleBefore.left).toBeCloseTo(200)

    const next = transformToShowRect(
      transform,
      400,
      400,
      200,
      200,
      { left: 40, top: 40, width: 36, height: 36 },
      0,
    )

    expect(next.translateX).toBeGreaterThan(transform.translateX)
    expect(next.translateY).toBeGreaterThan(transform.translateY)

    const visible = getVisibleContentRect(next, 400, 400, 200, 200)
    expect(visible.left).toBeLessThanOrEqual(40)
    expect(visible.top).toBeLessThanOrEqual(40)
  })

  it('accounts for padding and scale when panning', () => {
    const transform = { scale: 2, translateX: 0, translateY: 0 }
    // visible width = 100 at scale 2 with 200px viewport
    const next = transformToShowRect(
      transform,
      400,
      400,
      200,
      200,
      { left: 300, top: 200, width: 36, height: 36 },
      10,
    )

    expect(next.scale).toBe(2)
    const visible = getVisibleContentRect(next, 400, 400, 200, 200)
    expect(visible.left).toBeLessThanOrEqual(300 - 10)
    expect(visible.left + visible.width).toBeGreaterThanOrEqual(336 + 10)
  })
})
