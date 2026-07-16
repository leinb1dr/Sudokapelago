import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PuzzleViewport from '../../src/PuzzleViewport'

afterEach(() => {
  cleanup()
})

describe('PuzzleViewport', () => {
  it('zooms with buttons and reports CSS transform scale/translate', () => {
    const onTransformChange = vi.fn()
    render(
      <PuzzleViewport
        contentHeight={400}
        contentWidth={400}
        onTransformChange={onTransformChange}
        transform={{ scale: 1, translateX: 0, translateY: 0 }}
      >
        <div>board</div>
      </PuzzleViewport>,
    )

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
})
