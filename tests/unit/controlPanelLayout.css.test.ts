import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appCssPath = join(dirname(fileURLToPath(import.meta.url)), '../../src/App.css')
const entryCssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/EntryModeControls.css',
)
const difficultyCssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/DifficultyPicker.css',
)

describe('control panel layout CSS', () => {
  const appCss = readFileSync(appCssPath, 'utf8')
  const entryCss = readFileSync(entryCssPath, 'utf8')
  const difficultyCss = readFileSync(difficultyCssPath, 'utf8')

  it('places the board and entry controls side by side on wide screens', () => {
    expect(appCss).toMatch(
      /@media \(min-width:\s*52rem\)[\s\S]*\.board-stage\s*\{[^}]*flex-direction:\s*row/,
    )
    expect(appCss).toMatch(
      /@media \(min-width:\s*52rem\)[\s\S]*\.board-stage \.entry-mode-controls\s*\{[^}]*flex-direction:\s*column/,
    )
  })

  it('stacks condensed entry controls on narrow screens', () => {
    expect(entryCss).toMatch(
      /@media \(max-width:\s*40rem\)[\s\S]*\.entry-mode-controls\s*\{[^}]*flex-direction:\s*column/,
    )
    expect(entryCss).toMatch(
      /@media \(max-width:\s*40rem\)[\s\S]*\.entry-mode-controls__option span\s*\{[^}]*min-height:\s*1\.75rem/,
    )
  })

  it('keeps the difficulty picker compact on narrow screens', () => {
    expect(difficultyCss).toMatch(
      /@media \(max-width:\s*40rem\)[\s\S]*\.difficulty-picker__option small\s*\{[^}]*display:\s*none/,
    )
  })
})
