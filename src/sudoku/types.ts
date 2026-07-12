export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type CellValue = Digit | 0
export type Board = readonly CellValue[]
export type CandidateMask = number

export interface SolverState {
  board: CellValue[]
  candidates: CandidateMask[]
  contradiction: boolean
}

export const TECHNIQUE_NAMES = [
  'naked-single',
  'hidden-single',
  'cross-hatching',
  'pointing-pairs-triples',
  'locked-candidates',
  'naked-pair',
  'naked-triple',
  'hidden-pair',
  'hidden-triple',
  'x-wing',
  'y-wing',
  'swordfish',
] as const

export type TechniqueName = (typeof TECHNIQUE_NAMES)[number]

export interface TechniqueResult {
  changed: boolean
  placements: number
  eliminations: number
}

export interface HumanTechnique {
  name: TechniqueName
  apply: (state: SolverState) => TechniqueResult
}

export interface SolveStep extends TechniqueResult {
  technique: TechniqueName
}

export interface HumanSolveResult {
  solved: boolean
  board: CellValue[]
  steps: SolveStep[]
  reason: 'solved' | 'stalled' | 'invalid'
}

export interface SetterAttempt {
  cell: number
  digit: Digit
  accepted: boolean
  solveSteps: number
}

export interface SudokuPuzzle {
  puzzle: CellValue[]
  solution: CellValue[]
  difficulty: Difficulty
  attempts: SetterAttempt[]
  clues: number
}
