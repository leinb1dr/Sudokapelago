import './PuzzleViewport.css'
import { useEffect, useRef, useState } from 'react'

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
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
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

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }
    // Allow cell interaction; pan when holding Space or middle button, or
    // when clicking the viewport chrome (not a grid cell).
    const target = event.target as HTMLElement
    const onCell = Boolean(target.closest('[role="gridcell"]'))
    if (onCell && !event.shiftKey) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.translateX,
      originY: transform.translateY,
    }
    setIsPanning(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }
    onTransformChange({
      ...transform,
      translateX: drag.originX + (event.clientX - drag.startX),
      translateY: drag.originY + (event.clientY - drag.startY),
    })
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return
    }
    dragRef.current = null
    setIsPanning(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
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
        Scroll to zoom. Shift-drag (or drag empty space) to pan.
      </p>
    </div>
  )
}

export default PuzzleViewport
export { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, clampZoom }
