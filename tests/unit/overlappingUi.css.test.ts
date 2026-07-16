import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'

describe('overlapping UI styles', () => {
  it('uses CSS transform for pan/zoom rather than canvas', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/PuzzleViewport.css'),
      'utf8',
    )
    expect(css).toContain('puzzle-viewport__world')
    expect(css).toContain('will-change: transform')
    expect(css).not.toContain('canvas')
  })

  it('styles the minimap viewport highlight', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/PuzzleMinimap.css'),
      'utf8',
    )
    expect(css).toContain('puzzle-minimap__viewport')
    expect(css).toContain('puzzle-minimap__grid')
  })

  it('draws logical board outlines on a unified lattice', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/UnifiedOverlappingGrid.css'),
      'utf8',
    )
    expect(css).toContain('unified-grid__board-outline')
    expect(css).toMatch(/border:\s*4px solid/)
    expect(css).toContain('unified-grid__cell--empty')
    expect(css).toContain('unified-grid__cell--right-box')
  })
})
