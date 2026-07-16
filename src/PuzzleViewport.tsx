import './PuzzleViewport.css'
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react'

export interface ViewportTransform {
  scale: number
  translateX: number
  translateY: number
}

export interface ViewportRect {
  /** Visible area in content coordinates (unscaled). */
  x: number
  y: number
  width: number
  height: number
  contentWidth: number
  contentHeight: number
}

interface PuzzleViewportProps {
  children: ReactNode
  /** Content size in CSS pixels before transform. */
  contentWidth: number
  contentHeight: number
  minScale?: number
  maxScale?: number
  onViewportChange?: (viewport: ViewportRect, transform: ViewportTransform) => void
  'aria-label'?: string
}

const DEFAULT_MIN_SCALE = 0.35
const DEFAULT_MAX_SCALE = 2.5

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function PuzzleViewport({
  children,
  contentWidth,
  contentHeight,
  minScale = DEFAULT_MIN_SCALE,
  maxScale = DEFAULT_MAX_SCALE,
  onViewportChange,
  'aria-label': ariaLabel = 'Puzzle viewport',
}: PuzzleViewportProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<ViewportTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame || !onViewportChange) {
      return
    }

    const frameWidth = frame.clientWidth
    const frameHeight = frame.clientHeight
    const { scale, translateX, translateY } = transform

    onViewportChange(
      {
        x: -translateX / scale,
        y: -translateY / scale,
        width: frameWidth / scale,
        height: frameHeight / scale,
        contentWidth,
        contentHeight,
      },
      transform,
    )
  }, [transform, contentWidth, contentHeight, onViewportChange])

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const frame = frameRef.current
    if (!frame) {
      return
    }

    const rect = frame.getBoundingClientRect()
    const cursorX = event.clientX - rect.left
    const cursorY = event.clientY - rect.top
    const zoomFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1

    setTransform((current) => {
      const nextScale = clamp(current.scale * zoomFactor, minScale, maxScale)
      const ratio = nextScale / current.scale
      return {
        scale: nextScale,
        translateX: cursorX - (cursorX - current.translateX) * ratio,
        translateY: cursorY - (cursorY - current.translateY) * ratio,
      }
    })
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }
    // Don't start a pan when interacting with a focusable cell.
    const target = event.target as HTMLElement
    if (target.closest('[role="gridcell"]')) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.translateX,
      originY: transform.translateY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    setTransform((current) => ({
      ...current,
      translateX: drag.originX + (event.clientX - drag.startX),
      translateY: drag.originY + (event.clientY - drag.startY),
    }))
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
    }
  }

  function zoomBy(factor: number) {
    const frame = frameRef.current
    if (!frame) {
      return
    }
    const centerX = frame.clientWidth / 2
    const centerY = frame.clientHeight / 2

    setTransform((current) => {
      const nextScale = clamp(current.scale * factor, minScale, maxScale)
      const ratio = nextScale / current.scale
      return {
        scale: nextScale,
        translateX: centerX - (centerX - current.translateX) * ratio,
        translateY: centerY - (centerY - current.translateY) * ratio,
      }
    })
  }

  function resetView() {
    setTransform({ scale: 1, translateX: 0, translateY: 0 })
  }

  return (
    <div className="puzzle-viewport">
      <div className="puzzle-viewport__toolbar" role="toolbar" aria-label="Viewport controls">
        <button type="button" onClick={() => zoomBy(1.15)} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.15)} aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={resetView} aria-label="Reset view">
          Reset
        </button>
      </div>
      <div
        ref={frameRef}
        aria-label={ariaLabel}
        className="puzzle-viewport__frame"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        role="region"
      >
        <div
          className="puzzle-viewport__content"
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default PuzzleViewport
