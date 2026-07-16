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

  it('draws logical board outlines on a unified cell field', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/OverlappingSudokuBoard.css'),
      'utf8',
    )
    expect(css).toContain('overlapping-board__unified')
    expect(css).toContain('overlapping-board__outline')
    expect(css).toContain('overlapping-board__cell--inactive')
    expect(css).not.toContain('overlapping-board__grid--linked')
  })
})
