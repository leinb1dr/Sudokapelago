import { solverStateIsSolved, createSolverState } from './solverState'
import { getTechniquesForDifficulty } from './techniques'
import type {
  Board,
  Difficulty,
  HumanSolveResult,
  HumanTechnique,
} from './types'

const MAX_TECHNIQUE_APPLICATIONS = 4096

export interface HumanSolverOptions {
  difficulty: Difficulty
  techniques?: readonly HumanTechnique[]
}

function resultFromState(
  solved: boolean,
  state: ReturnType<typeof createSolverState>,
  steps: HumanSolveResult['steps'],
  reason: HumanSolveResult['reason'],
): HumanSolveResult {
  return {
    solved,
    board: [...state.board],
    steps,
    reason,
  }
}

export function solveWithHumanTechniques(
  board: Board,
  options: HumanSolverOptions,
): HumanSolveResult {
  const state = createSolverState(board)
  const steps: HumanSolveResult['steps'] = []

  if (state.contradiction) {
    return resultFromState(false, state, steps, 'invalid')
  }

  if (solverStateIsSolved(state)) {
    return resultFromState(true, state, steps, 'solved')
  }

  const techniques =
    options.techniques ?? getTechniquesForDifficulty(options.difficulty)

  for (
    let applicationCount = 0;
    applicationCount < MAX_TECHNIQUE_APPLICATIONS;
    applicationCount += 1
  ) {
    let changed = false

    for (const technique of techniques) {
      const techniqueResult = technique.apply(state)

      if (state.contradiction) {
        return resultFromState(false, state, steps, 'invalid')
      }

      if (!techniqueResult.changed) {
        continue
      }

      steps.push({
        technique: technique.name,
        ...techniqueResult,
      })
      changed = true
      break
    }

    if (solverStateIsSolved(state)) {
      return resultFromState(true, state, steps, 'solved')
    }

    if (!changed) {
      return resultFromState(false, state, steps, 'stalled')
    }
  }

  return resultFromState(false, state, steps, 'invalid')
}
