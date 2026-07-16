import { describe, expect, it, vi } from 'vitest'
import { createWorkerFillGrid } from '../../src/sudoku/overlapping/workerClient'

describe('overlap worker client', () => {
  it('returns null when Worker is unavailable', () => {
    const previous = globalThis.Worker
    // @ts-expect-error intentional removal for the test
    delete globalThis.Worker
    expect(createWorkerFillGrid()).toBeNull()
    globalThis.Worker = previous
  })

  it('returns null when Worker construction throws', () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('unsupported')
        }
      },
    )
    expect(createWorkerFillGrid()).toBeNull()
    vi.unstubAllGlobals()
  })
})
