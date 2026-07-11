import {
  CELL_COUNT,
  PEERS,
  digitToMask,
  getCandidateMask,
  isSolvedBoard,
  isValidBoard,
  maskHasDigit,
} from './grid'
import type {
  Board,
  CandidateMask,
  Digit,
  SolverState,
  TechniqueResult,
} from './types'

export function createSolverState(board: Board): SolverState {
  const mutableBoard = [...board]
  const state: SolverState = {
    board: mutableBoard,
    candidates: Array<CandidateMask>(CELL_COUNT).fill(0),
    contradiction: !isValidBoard(mutableBoard),
  }

  if (mutableBoard.length !== CELL_COUNT || state.contradiction) {
    return state
  }

  state.candidates = mutableBoard.map((value, cell) =>
    value === 0 ? getCandidateMask(mutableBoard, cell) : 0,
  )
  state.contradiction = state.candidates.some(
    (mask, cell) => mutableBoard[cell] === 0 && mask === 0,
  )

  return state
}

export function cloneSolverState(state: SolverState): SolverState {
  return {
    board: [...state.board],
    candidates: [...state.candidates],
    contradiction: state.contradiction,
  }
}

export function resultFromCounts(
  placements = 0,
  eliminations = 0,
): TechniqueResult {
  return {
    changed: placements > 0 || eliminations > 0,
    placements,
    eliminations,
  }
}

export function eliminateCandidate(
  state: SolverState,
  cell: number,
  digit: Digit,
): boolean {
  if (
    state.contradiction ||
    state.board[cell] !== 0 ||
    !maskHasDigit(state.candidates[cell], digit)
  ) {
    return false
  }

  state.candidates[cell] &= ~digitToMask(digit)
  if (state.candidates[cell] === 0) {
    state.contradiction = true
  }
  return true
}

export function placeDigit(
  state: SolverState,
  cell: number,
  digit: Digit,
): TechniqueResult {
  if (state.contradiction) {
    return resultFromCounts()
  }

  if (state.board[cell] !== 0) {
    if (state.board[cell] !== digit) {
      state.contradiction = true
    }
    return resultFromCounts()
  }

  if (
    !maskHasDigit(state.candidates[cell], digit) ||
    PEERS[cell].some((peer) => state.board[peer] === digit)
  ) {
    state.contradiction = true
    return resultFromCounts()
  }

  state.board[cell] = digit
  state.candidates[cell] = 0

  let eliminations = 0
  for (const peer of PEERS[cell]) {
    eliminations += Number(eliminateCandidate(state, peer, digit))
  }

  return resultFromCounts(1, eliminations)
}

export function solverStateIsSolved(state: SolverState): boolean {
  return !state.contradiction && isSolvedBoard(state.board)
}
