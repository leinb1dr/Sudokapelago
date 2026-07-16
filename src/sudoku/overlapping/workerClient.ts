import type { ConstrainedFillRequest, ConstrainedFillResult } from './types'
import type {
  OverlapWorkerRequest,
  OverlapWorkerResponse,
} from './overlapFill.worker'

/**
 * Creates a fill function that fans constrained grid generation out to a
 * module worker. Falls back to null when Worker is unavailable (e.g. some
 * test environments) so the caller can use the sync path.
 */
export function createWorkerFillGrid():
  | ((request: ConstrainedFillRequest) => Promise<ConstrainedFillResult>)
  | null {
  if (typeof Worker === 'undefined') {
    return null
  }

  let worker: Worker
  try {
    worker = new Worker(
      new URL('./overlapFill.worker.ts', import.meta.url),
      { type: 'module' },
    )
  } catch {
    return null
  }

  let nextId = 1
  const pending = new Map<
    number,
    {
      resolve: (result: ConstrainedFillResult) => void
      reject: (error: Error) => void
    }
  >()

  worker.onmessage = (event: MessageEvent<OverlapWorkerResponse>) => {
    const message = event.data
    if (message.type !== 'fill-result') {
      return
    }
    const entry = pending.get(message.id)
    if (!entry) {
      return
    }
    pending.delete(message.id)
    entry.resolve(message.result)
  }

  worker.onerror = (event) => {
    const error = new Error(event.message || 'Overlap fill worker failed.')
    for (const entry of pending.values()) {
      entry.reject(error)
    }
    pending.clear()
  }

  return (request: ConstrainedFillRequest) =>
    new Promise<ConstrainedFillResult>((resolve, reject) => {
      const id = nextId
      nextId += 1
      pending.set(id, { resolve, reject })
      const message: OverlapWorkerRequest = {
        type: 'fill',
        id,
        payload: request,
      }
      worker.postMessage(message)
    })
}
