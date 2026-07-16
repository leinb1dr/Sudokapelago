import type { ConstrainedGridRequest, ConstrainedGridResult } from './types'
import { solveConstrainedGrid } from './generator'

export type ConstrainedFillFn = (
  request: ConstrainedGridRequest,
) => Promise<ConstrainedGridResult>

/**
 * Create an async fill function that fans work out to a Web Worker when
 * available, falling back to the synchronous constrained fill on failure
 * (e.g. unit tests / unsupported environments).
 */
export function createWorkerFillFn(): ConstrainedFillFn {
  if (typeof Worker === 'undefined') {
    return async (request) => solveConstrainedGrid(request)
  }

  let worker: Worker | null = null
  let nextId = 0
  const pending = new Map<
    string,
    {
      resolve: (result: ConstrainedGridResult) => void
      reject: (error: Error) => void
    }
  >()

  try {
    worker = new Worker(
      new URL('./overlapGridWorker.ts', import.meta.url),
      { type: 'module' },
    )
  } catch {
    return async (request) => solveConstrainedGrid(request)
  }

  worker.onmessage = (event: MessageEvent) => {
    const data = event.data as {
      type: string
      id: string
      result: ConstrainedGridResult
    }
    if (data.type !== 'fill-result') {
      return
    }
    const waiter = pending.get(data.id)
    if (!waiter) {
      return
    }
    pending.delete(data.id)
    waiter.resolve(data.result)
  }

  worker.onerror = () => {
    for (const waiter of pending.values()) {
      waiter.reject(new Error('Overlap grid worker failed.'))
    }
    pending.clear()
  }

  return async (request) => {
    if (!worker) {
      return solveConstrainedGrid(request)
    }

    const id = `fill-${nextId}`
    nextId += 1

    return new Promise<ConstrainedGridResult>((resolve, reject) => {
      pending.set(id, { resolve, reject })
      try {
        worker?.postMessage({ type: 'fill', id, request })
      } catch (error) {
        pending.delete(id)
        resolve(solveConstrainedGrid(request))
        void error
      }
    })
  }
}

export async function fillWithOptionalWorker(
  request: ConstrainedGridRequest,
  fillFn?: ConstrainedFillFn,
): Promise<ConstrainedGridResult> {
  if (fillFn) {
    return fillFn(request)
  }
  return solveConstrainedGrid(request)
}
