import { createSeededRandom } from '../generator'
import { fillFromRequest } from './constrainedFill'
import type { ConstrainedFillRequest, ConstrainedFillResult } from './types'

export type OverlapWorkerRequest = {
  type: 'fill'
  id: number
  payload: ConstrainedFillRequest
}

export type OverlapWorkerResponse = {
  type: 'fill-result'
  id: number
  result: ConstrainedFillResult
}

function handleFill(request: ConstrainedFillRequest): ConstrainedFillResult {
  return fillFromRequest(request, createSeededRandom(request.seed))
}

declare const self: {
  onmessage: ((event: MessageEvent<OverlapWorkerRequest>) => void) | null
  postMessage: (message: OverlapWorkerResponse) => void
}

self.onmessage = (event: MessageEvent<OverlapWorkerRequest>) => {
  const message = event.data
  if (message.type !== 'fill') {
    return
  }

  const result = handleFill(message.payload)
  self.postMessage({
    type: 'fill-result',
    id: message.id,
    result,
  })
}
