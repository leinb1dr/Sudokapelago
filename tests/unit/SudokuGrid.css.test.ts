import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const cssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/SudokuGrid.css',
)

describe('SudokuGrid.css pencil mark padding', () => {
  const css = readFileSync(cssPath, 'utf8')

  it('keeps standard and corner marks inset enough to clear thick borders', () => {
    const standardInset = css.match(
      /\.sudoku-grid__standard-marks\s*\{[^}]*inset:\s*([\d.]+)rem/,
    )?.[1]
    const cornerInset = css.match(
      /\.sudoku-grid__corner-marks\s*\{[^}]*inset:\s*([\d.]+)rem/,
    )?.[1]

    expect(Number(standardInset)).toBeGreaterThanOrEqual(0.3)
    expect(Number(cornerInset)).toBeGreaterThanOrEqual(0.3)
  })
})
