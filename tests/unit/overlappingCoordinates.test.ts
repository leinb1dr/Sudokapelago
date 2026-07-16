import { describe, expect, it } from 'vitest'
import {
  computeSharedGlobalCells,
  isExactOverlap,
  lateralOffsetForOverlap,
  listAttachmentCandidates,
  localToGlobal,
  globalToLocal,
  sharedCellCountForOverlap,
} from '../../src/sudoku/overlapping/coordinates'
import type { GridNode } from '../../src/sudoku/overlapping/types'

describe('overlapping coordinates', () => {
  it('maps local cells into the global coordinate space', () => {
    const origin = { x: 6, y: -6 }
    expect(localToGlobal(origin, 0)).toEqual({ x: 6, y: -6 })
    expect(localToGlobal(origin, 80)).toEqual({ x: 14, y: 2 })
    expect(globalToLocal(origin, { x: 6, y: -6 })).toBe(0)
    expect(globalToLocal(origin, { x: 14, y: 2 })).toBe(80)
    expect(globalToLocal(origin, { x: 0, y: 0 })).toBeNull()
  })

  it('derives lateral offsets for 1/2/3 box overlaps', () => {
    expect(lateralOffsetForOverlap(1)).toBe(6)
    expect(lateralOffsetForOverlap(2)).toBe(3)
    expect(lateralOffsetForOverlap(3)).toBe(0)
  })

  it('lists edge attachments that share exactly N boxes', () => {
    const parent: GridNode = { id: 0, origin: { x: 0, y: 0 } }

    for (const overlapBoxes of [1, 2, 3] as const) {
      const candidates = listAttachmentCandidates(parent, overlapBoxes)
      expect(candidates.length).toBe(overlapBoxes === 3 ? 4 : 8)

      for (const candidate of candidates) {
        expect(
          isExactOverlap(parent.origin, candidate.origin, overlapBoxes),
        ).toBe(true)
        expect(
          computeSharedGlobalCells(parent.origin, candidate.origin),
        ).toHaveLength(sharedCellCountForOverlap(overlapBoxes))
      }
    }
  })

  it('treats classic Samurai corner placement as a 1-box overlap', () => {
    const shared = computeSharedGlobalCells({ x: 0, y: 0 }, { x: 6, y: 6 })
    expect(shared).toHaveLength(9)
    expect(shared).toContainEqual({ x: 6, y: 6 })
    expect(shared).toContainEqual({ x: 8, y: 8 })
  })
})
