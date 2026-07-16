/**
 * Web Worker entry for constrained overlapping-grid fills.
 * The main thread posts ConstrainedGridRequest messages and receives
 * ConstrainedGridResult replies. Keeping fill logic in constrainedFill.ts
 * lets unit tests exercise the same path without workers.
 */
import { solveConstrainedGrid } from './generator'
import type { ConstrainedGridRequest } from './types'

export interface WorkerRequestMessage {
  type: 'fill'
  id: string
  request: ConstrainedGridRequest
}

export interface WorkerResponseMessage {
  type: 'fill-result'
  id: string
  result: ReturnType<typeof solveConstrainedGrid>
}

self.onmessage = (event: MessageEvent<WorkerRequestMessage>) => {
  const message = event.data
  if (message.type !== 'fill') {
    return
  }

  const result = solveConstrainedGrid(message.request)
  const response: WorkerResponseMessage = {
    type: 'fill-result',
    id: message.id,
    result,
  }
  self.postMessage(response)
}
