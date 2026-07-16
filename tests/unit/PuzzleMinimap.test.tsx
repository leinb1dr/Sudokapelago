import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PuzzleMinimap from '../../src/PuzzleMinimap'
import { buildSpiralTopology } from '../../src/sudoku/overlapping/topology'

afterEach(() => {
  cleanup()
})

describe('PuzzleMinimap', () => {
  it('renders a rectangle for each grid and a viewport highlight', () => {
    const topology = buildSpiralTopology(1, 3)
    render(
      <PuzzleMinimap
        contentHeight={400}
        contentWidth={500}
        topology={topology}
        transform={{ scale: 1, translateX: 0, translateY: 0 }}
        viewportHeight={200}
        viewportWidth={200}
      />,
    )

    expect(document.querySelectorAll('.puzzle-minimap__grid')).toHaveLength(3)
    expect(document.querySelector('.puzzle-minimap__viewport')).not.toBeNull()
    expect(document.querySelector('.puzzle-minimap__label')?.textContent).toBe(
      'Overview',
    )
  })
})
