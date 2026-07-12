import type { Difficulty, HumanSolveResult, SolveStep } from './types'

export function formatSolveStep(step: SolveStep, stepNumber: number): string[] {
  const lines = [`Step ${stepNumber}: ${step.details.summary}`]
  lines.push(...step.details.reasoning.map((line) => `  ${line}`))
  return lines
}

export function logHumanSolveResult(
  result: HumanSolveResult,
  difficulty: Difficulty,
): void {
  const header = `[Sudokapelago] Human solve (${difficulty}) — ${result.reason}`

  console.group(header)
  console.log(`Solved: ${result.solved}`)

  if (result.steps.length === 0) {
    console.log('No technique steps were applied.')
  } else {
    console.log(`${result.steps.length} step(s):`)
    for (const [index, step] of result.steps.entries()) {
      for (const line of formatSolveStep(step, index + 1)) {
        console.log(line)
      }
    }
  }

  console.groupEnd()
}
