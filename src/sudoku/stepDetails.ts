import {
  CELL_COUNT,
  PEERS,
  getColumn,
  getRow,
  maskToDigits,
} from './grid'
import type {
  Digit,
  SolveStepAction,
  SolveStepDetails,
  SolverState,
  TechniqueName,
} from './types'

const TECHNIQUE_LABELS: Record<TechniqueName, string> = {
  'cross-hatching': 'Cross Hatch',
  'hidden-single': 'Hidden Single',
  'naked-single': 'Naked Single',
  'pointing-pairs-triples': 'Pointing Pairs/Triples',
  'locked-candidates': 'Locked Candidates',
  'naked-pair': 'Naked Pair',
  'naked-triple': 'Naked Triple',
  'hidden-pair': 'Hidden Pair',
  'hidden-triple': 'Hidden Triple',
  'x-wing': 'X-Wing',
  'y-wing': 'Y-Wing',
  swordfish: 'Swordfish',
}

export function formatCell(cell: number): string {
  return `r${getRow(cell) + 1} c${getColumn(cell) + 1}`
}

export function formatCells(cells: readonly number[]): string {
  return cells.map(formatCell).join(', ')
}

export function formatTechniqueLabel(technique: TechniqueName): string {
  return TECHNIQUE_LABELS[technique]
}

export function buildNakedSingleDetails(
  state: SolverState,
  cell: number,
  digit: Digit,
): SolveStepDetails {
  const blockingPeers = PEERS[cell].filter((peer) => state.board[peer] !== 0)
  const reasoning = [`Checking ${formatCell(cell)} for naked single.`]

  if (blockingPeers.length > 0) {
    const blockDescriptions = blockingPeers.map(
      (peer) => `${formatCell(peer)} has ${state.board[peer]}`,
    )
    reasoning.push(
      `Checked ${formatCell(cell)}: ${blockingPeers.length} block${blockingPeers.length === 1 ? '' : 's'} at ${formatCells(blockingPeers)} (${blockDescriptions.join('; ')}).`,
    )
  } else {
    reasoning.push(
      `Checked ${formatCell(cell)}: no filled peers are blocking candidates yet.`,
    )
  }

  reasoning.push(`Only option left is ${digit}.`)

  return {
    summary: `Naked Single: ${formatCell(cell)} set ${digit}`,
    reasoning,
    actions: [{ type: 'placement', cell, digit }],
  }
}

export function buildHiddenSingleDetails(
  unitType: 'row' | 'column',
  unitIndex: number,
  digit: Digit,
  targetCell: number,
  candidateCells: readonly number[],
): SolveStepDetails {
  const unitLabel =
    unitType === 'row' ? `row ${unitIndex + 1}` : `column ${unitIndex + 1}`

  return {
    summary: `Hidden Single: ${formatCell(targetCell)} set ${digit}`,
    reasoning: [
      `Checking ${unitLabel} for digit ${digit}.`,
      `Candidate cells: ${formatCells(candidateCells)}.`,
      `Only ${formatCell(targetCell)} can hold ${digit} in this ${unitType}.`,
    ],
    actions: [{ type: 'placement', cell: targetCell, digit }],
  }
}

export function buildCrossHatchDetails(
  boxIndex: number,
  digit: Digit,
  targetCell: number,
  candidateCells: readonly number[],
): SolveStepDetails {
  return {
    summary: `Cross Hatch: ${formatCell(targetCell)} set ${digit}`,
    reasoning: [
      `Cross-hatching box ${boxIndex + 1} for digit ${digit}.`,
      `Candidate cells: ${formatCells(candidateCells)}.`,
      `Only ${formatCell(targetCell)} can hold ${digit} in this box.`,
    ],
    actions: [{ type: 'placement', cell: targetCell, digit }],
  }
}

export function buildDetailsFromDiff(
  before: SolverState,
  after: SolverState,
  technique: TechniqueName,
): SolveStepDetails {
  const actions: SolveStepAction[] = []

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (before.board[cell] === 0 && after.board[cell] !== 0) {
      actions.push({
        type: 'placement',
        cell,
        digit: after.board[cell] as Digit,
      })
    }
  }

  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    const removedMask = before.candidates[cell] & ~after.candidates[cell]
    for (const digit of maskToDigits(removedMask)) {
      actions.push({ type: 'elimination', cell, digit })
    }
  }

  const techniqueLabel = formatTechniqueLabel(technique)
  const placements = actions.filter((action) => action.type === 'placement')
  const eliminations = actions.filter((action) => action.type === 'elimination')

  if (placements.length === 1 && eliminations.length === 0) {
    const { cell, digit } = placements[0]
    return {
      summary: `${techniqueLabel}: ${formatCell(cell)} set ${digit}`,
      reasoning: [`Applied ${techniqueLabel}.`],
      actions,
    }
  }

  const reasoning: string[] = [`Applied ${techniqueLabel}.`]

  if (placements.length > 0) {
    reasoning.push(
      `Placements: ${placements.map((action) => `${formatCell(action.cell)} set ${action.digit}`).join('; ')}.`,
    )
  }

  if (eliminations.length > 0) {
    reasoning.push(
      `Eliminations: ${eliminations.map((action) => `${formatCell(action.cell)} ≠ ${action.digit}`).join('; ')}.`,
    )
  }

  return {
    summary: `${techniqueLabel}: ${placements.length} placement(s), ${eliminations.length} elimination(s)`,
    reasoning,
    actions,
  }
}
