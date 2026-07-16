import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PuzzleViewport from '../../src/PuzzleViewport'
import { LONG_PRESS_MS } from '../../src/longPressPan'

afterEach(() => {
  cleanup()
})

function renderViewport(
  onTransformChange = vi.fn(),
  children: React.ReactNode = <div>board</div>,
) {
  render(
    <PuzzleViewport
      contentHeight={400}
      contentWidth={400}
      onTransformChange={onTransformChange}
      transform={{ scale: 1, translateX: 0, translateY: 0 }}
    >
      {children}
    </PuzzleViewport>,
  )
  return {
    onTransformChange,
    viewport: screen.getByRole('region', { name: 'Puzzle viewport' }),
  }
}

describe('PuzzleViewport', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('zooms with buttons and reports CSS transform scale/translate', () => {
    const onTransformChange = vi.fn()
    renderViewport(onTransformChange)

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(onTransformChange).toHaveBeenCalledWith({
      scale: 1.1,
      translateX: 0,
      translateY: 0,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }))
    expect(onTransformChange).toHaveBeenCalledWith({
      scale: 1,
      translateX: 0,
      translateY: 0,
    })

    const world = document.querySelector('.puzzle-viewport__world')
    expect(world).not.toBeNull()
    expect((world as HTMLElement).style.transform).toContain('scale(1)')
  })

  it('pans immediately when dragging empty viewport chrome', () => {
    const { onTransformChange, viewport } = renderViewport()

    fireEvent.pointerDown(viewport, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    })
    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 140,
      clientY: 120,
    })

    expect(onTransformChange).toHaveBeenCalledWith({
      scale: 1,
      translateX: 40,
      translateY: 20,
    })
    expect(viewport.className).toContain('puzzle-viewport--panning')
  })

  it('does not pan immediately on a cell without Shift', () => {
    const onTransformChange = vi.fn()
    const { viewport } = renderViewport(
      onTransformChange,
      <div role="gridcell">cell</div>,
    )
    const cell = screen.getByRole('gridcell')

    fireEvent.pointerDown(cell, {
      button: 0,
      pointerId: 1,
      clientX: 50,
      clientY: 50,
    })
    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 90,
      clientY: 80,
    })

    expect(onTransformChange).not.toHaveBeenCalled()
    expect(viewport.className).not.toContain('puzzle-viewport--panning')
  })

  it('activates pan after a long-press on a cell', () => {
    vi.useFakeTimers()
    const onTransformChange = vi.fn()
    const { viewport } = renderViewport(
      onTransformChange,
      <div role="gridcell">cell</div>,
    )
    const cell = screen.getByRole('gridcell')

    fireEvent.pointerDown(cell, {
      button: 0,
      pointerId: 1,
      clientX: 50,
      clientY: 50,
    })

    expect(viewport.className).not.toContain('puzzle-viewport--panning')

    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS)
    })

    expect(viewport.className).toContain('puzzle-viewport--panning')

    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 90,
      clientY: 70,
    })

    expect(onTransformChange).toHaveBeenCalledWith({
      scale: 1,
      translateX: 40,
      translateY: 20,
    })
  })

  it('cancels a pending long-press when the pointer moves too far', () => {
    vi.useFakeTimers()
    const onTransformChange = vi.fn()
    const { viewport } = renderViewport(
      onTransformChange,
      <div role="gridcell">cell</div>,
    )
    const cell = screen.getByRole('gridcell')

    fireEvent.pointerDown(cell, {
      button: 0,
      pointerId: 1,
      clientX: 50,
      clientY: 50,
    })
    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 80,
      clientY: 50,
    })
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS)
    })

    expect(viewport.className).not.toContain('puzzle-viewport--panning')
    expect(onTransformChange).not.toHaveBeenCalled()
  })

  it('pans immediately with Shift-drag on a cell', () => {
    const onTransformChange = vi.fn()
    const { viewport } = renderViewport(
      onTransformChange,
      <div role="gridcell">cell</div>,
    )
    const cell = screen.getByRole('gridcell')

    fireEvent.pointerDown(cell, {
      button: 0,
      pointerId: 1,
      clientX: 50,
      clientY: 50,
      shiftKey: true,
    })
    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 70,
      clientY: 90,
    })

    expect(onTransformChange).toHaveBeenCalledWith({
      scale: 1,
      translateX: 20,
      translateY: 40,
    })
  })

  it('suppresses the following click after a long-press pan', () => {
    vi.useFakeTimers()
    const onCellClick = vi.fn()
    const { viewport } = renderViewport(
      vi.fn(),
      <div
        onClick={onCellClick}
        role="gridcell"
      >
        cell
      </div>,
    )
    const cell = screen.getByRole('gridcell')

    fireEvent.pointerDown(cell, {
      button: 0,
      pointerId: 1,
      clientX: 50,
      clientY: 50,
    })
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS)
    })
    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 80,
      clientY: 50,
    })
    fireEvent.pointerUp(viewport, { pointerId: 1 })
    fireEvent.click(cell)

    expect(onCellClick).not.toHaveBeenCalled()
  })

  it('describes long-press pan in the viewport hint', () => {
    renderViewport()
    expect(
      screen.getByText(/Long-press or Shift-drag to pan/i),
    ).toBeTruthy()
  })
})
