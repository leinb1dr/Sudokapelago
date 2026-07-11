import { BOX_SIZE, DIGITS, GRID_SIZE } from './grid'
import type { CellValue, Digit } from './types'

export type RandomSource = () => number

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function shuffle<T>(
  values: readonly T[],
  random: RandomSource = Math.random,
): T[] {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ]
  }

  return shuffled
}

function shuffledGroupIndexes(random: RandomSource): number[] {
  return shuffle([0, 1, 2], random).flatMap((group) =>
    shuffle([0, 1, 2], random).map((offset) => group * BOX_SIZE + offset),
  )
}

function pattern(row: number, column: number): number {
  return (row * BOX_SIZE + Math.floor(row / BOX_SIZE) + column) % GRID_SIZE
}

export function generateSolvedBoard(
  random: RandomSource = Math.random,
): CellValue[] {
  const rows = shuffledGroupIndexes(random)
  const columns = shuffledGroupIndexes(random)
  const digits = shuffle<Digit>(DIGITS, random)
  const transpose = random() < 0.5

  return rows.flatMap((row) =>
    columns.map((column) => {
      const patternIndex = transpose
        ? pattern(column, row)
        : pattern(row, column)
      return digits[patternIndex]
    }),
  )
}
