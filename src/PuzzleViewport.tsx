import './PuzzleViewport.css'
import { useEffect, useRef, useState } from 'react'
import {
  exceedsMoveTolerance,
  LONG_PRESS_MS,
  shouldStartImmediatePan,
} from './longPressPan'

const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.1

export interface PuzzleViewportTransform {
  scale: number
  translateX: number
  translateY: number
}

interface PuzzleViewportProps {
  children: React.ReactNode
  /** Content size in CSS pixels at scale 1 (unscaled board world). */
  contentWidth: number
  contentHeight: number
  transform: PuzzleViewportTransform
  onTransformChange: (transform: PuzzleViewportTransform) => void
  className?: string
}

interface PanDragState {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
}

interface PendingLongPressState extends PanDragState {
  timerId: number
}

function clampZoom(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale))
}

function PuzzleViewport({
  children,
  contentWidth,
  contentHeight,
  transform,
  onTransformChange,
  className,
}: PuzzleViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<PanDragState | null>(null)
  const pendingLongPressRef = useRef<PendingLongPressState | null>(null)
  const suppressClickRef = useRef(false)
  const [isPanning, setIsPanning] = useState(false)

  useEffect(() => {
    const element = viewportRef.current
    if (!element) {
      return
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const direction = event.deltaY > 0 ? -1 : 1
      onTransformChange({
        ...transform,
        scale: clampZoom(transform.scale + direction * ZOOM_STEP),
      })
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', onWheel)
    }
  }, [onTransformChange, transform])

  useEffect(() => {
    return () => {
      const pending = pendingLongPressRef.current
      if (pending) {
        window.clearTimeout(pending.timerId)
        pendingLongPressRef.current = null
      }
    }
  }, [])

  function clearPendingLongPress() {
    const pending = pendingLongPressRef.current
    if (!pending) {
      return
    }
    window.clearTimeout(pending.timerId)
    pendingLongPressRef.current = null
  }

  function beginPan(drag: PanDragState, element: HTMLElement) {
    dragRef.current = drag
    setIsPanning(true)
    if (typeof element.setPointerCapture === 'function') {
      element.setPointerCapture(drag.pointerId)
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }
    if (dragRef.current || pendingLongPressRef.current) {
      return
    }

    const target = event.target as HTMLElement
    const onCell = Boolean(target.closest('[role="gridcell"]'))
    const drag: PanDragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.translateX,
      originY: transform.translateY,
    }

    if (shouldStartImmediatePan(onCell, event.shiftKey)) {
      beginPan(drag, event.currentTarget)
      return
    }

    // On a cell without Shift: wait for a long-press before panning so a
    // short tap can still select. Works even when boards fill the viewport
    // (e.g. 3-box overlap with no empty chrome to grab).
    const viewport = event.currentTarget
    const timerId = window.setTimeout(() => {
      const pending = pendingLongPressRef.current
      if (!pending || pending.pointerId !== drag.pointerId) {
        return
      }
      pendingLongPressRef.current = null
      suppressClickRef.current = true
      beginPan(pending, viewport)
    }, LONG_PRESS_MS)

    pendingLongPressRef.current = { ...drag, timerId }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const pending = pendingLongPressRef.current
    if (pending && pending.pointerId === event.pointerId) {
      if (
        exceedsMoveTolerance(
          pending.startX,
          pending.startY,
          event.clientX,
          event.clientY,
        )
      ) {
        clearPendingLongPress()
      }
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    if (
      exceedsMoveTolerance(drag.startX, drag.startY, event.clientX, event.clientY)
    ) {
      suppressClickRef.current = true
    }

    onTransformChange({
      ...transform,
      translateX: drag.originX + (event.clientX - drag.startX),
      translateY: drag.originY + (event.clientY - drag.startY),
    })
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (pendingLongPressRef.current?.pointerId === event.pointerId) {
      clearPendingLongPress()
    }

    if (dragRef.current?.pointerId !== event.pointerId) {
      return
    }

    dragRef.current = null
    setIsPanning(false)
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    // Clicks usually follow pointerup in the same turn; clear the suppress
    // flag shortly after in case no click event is synthesized (e.g. touch).
    if (suppressClickRef.current) {
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 350)
    }
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }

  function zoomBy(delta: number) {
    onTransformChange({
      ...transform,
      scale: clampZoom(transform.scale + delta),
    })
  }

  function resetView() {
    onTransformChange({ scale: 1, translateX: 0, translateY: 0 })
  }

  return (
    <div className={['puzzle-viewport-shell', className].filter(Boolean).join(' ')}>
      <div
        ref={viewportRef}
        aria-label="Puzzle viewport"
        className={
          isPanning
            ? 'puzzle-viewport puzzle-viewport--panning'
            : 'puzzle-viewport'
        }
        onClickCapture={handleClickCapture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        role="region"
      >
        <div
          className="puzzle-viewport__world"
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `translate(calc(-50% + ${transform.translateX}px), calc(-50% + ${transform.translateY}px)) scale(${transform.scale})`,
          }}
        >
          {children}
        </div>
      </div>

      <div className="puzzle-viewport__controls" role="group" aria-label="View controls">
        <button
          type="button"
          className="puzzle-viewport__button"
          onClick={() => {
            zoomBy(-ZOOM_STEP)
          }}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          className="puzzle-viewport__button"
          onClick={() => {
            zoomBy(ZOOM_STEP)
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="puzzle-viewport__button puzzle-viewport__button--wide"
          onClick={resetView}
        >
          Reset view
        </button>
        <span className="puzzle-viewport__zoom-label">
          {Math.round(transform.scale * 100)}%
        </span>
      </div>
      <p className="puzzle-viewport__hint">
        Scroll to zoom. Long-press or Shift-drag to pan.
      </p>
    </div>
  )
}

export default PuzzleViewport
