import { Client } from 'archipelago.js'
import { useEffect, useState } from 'react'
import './App.css'
import DifficultyPicker from './DifficultyPicker'
import EntryModeControls from './EntryModeControls'
import OverlapControls, { type PuzzleMode } from './OverlapControls'
import OverlappingSudokuBoard from './OverlappingSudokuBoard'
import SudokuGrid from './SudokuGrid'
import { solveWithHumanTechniques } from './sudoku/humanSolver'
import { logHumanSolveResult } from './sudoku/solveStepLog'
import {
  createEmptyPencilBoard,
  type CornerCenterMode,
  type EntryMode,
  type PencilBoard,
  type PencilStyle,
} from './sudoku/pencilMarks'
import { createSudokuPuzzle } from './sudoku/setter'
import { CELL_COUNT } from './sudoku/grid'
import {
  createOverlappingSudokuPuzzle,
  createWorkerFillGrid,
  extractLocalBoard,
  solveOverlappingPuzzle,
  type GlobalBoard,
  type OverlapBoxes,
  type OverlappingSudokuPuzzle,
} from './sudoku/overlapping'
import type { Board, Difficulty, SudokuPuzzle } from './sudoku/types'
import useEntryModeHotkeys from './useEntryModeHotkeys'

// A single shared Archipelago client. It is not connected to any server yet;
// this simply proves the archipelago.js integration is wired up and ready.
const archipelagoClient = new Client()

function createEmptyBoard(): Board {
  return Array<Board[number]>(CELL_COUNT).fill(0)
}

function App() {
  const archipelagoReady = archipelagoClient instanceof Client
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [mode, setMode] = useState<PuzzleMode>('standard')
  const [overlapBoxes, setOverlapBoxes] = useState<OverlapBoxes>(1)
  const [gridCount, setGridCount] = useState(6)
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [overlappingPuzzle, setOverlappingPuzzle] =
    useState<OverlappingSudokuPuzzle | null>(null)
  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [globalBoard, setGlobalBoard] = useState<GlobalBoard>(() => new Map())
  const [pencilBoard, setPencilBoard] = useState<PencilBoard>(() =>
    createEmptyPencilBoard(),
  )
  const [entryMode, setEntryMode] = useState<EntryMode>('digit')
  const [pencilStyle, setPencilStyle] = useState<PencilStyle>('standard')
  const [cornerCenterMode, setCornerCenterMode] =
    useState<CornerCenterMode>('corner')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const effectiveCornerCenterMode = useEntryModeHotkeys({
    cornerCenterMode,
    entryMode,
    onCornerCenterModeChange: setCornerCenterMode,
    onEntryModeChange: setEntryMode,
  })

  useEffect(() => {
    if (puzzle) {
      setBoard([...puzzle.puzzle])
      setPencilBoard(createEmptyPencilBoard())
    }
  }, [puzzle])

  useEffect(() => {
    if (overlappingPuzzle) {
      setGlobalBoard(new Map(overlappingPuzzle.puzzle))
    }
  }, [overlappingPuzzle])

  async function generatePuzzle() {
    setIsGenerating(true)
    setGenerateError(null)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    })

    try {
      if (mode === 'standard') {
        setOverlappingPuzzle(null)
        setPuzzle(createSudokuPuzzle({ difficulty }))
      } else {
        setPuzzle(null)
        const fillGrid = createWorkerFillGrid() ?? undefined
        const generated = await createOverlappingSudokuPuzzle({
          difficulty,
          overlapBoxes,
          gridCount,
          fillGrid,
        })
        setOverlappingPuzzle(generated)
      }
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : 'Puzzle generation failed.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function debugSolve() {
    if (mode === 'overlapping' && overlappingPuzzle) {
      const result = solveOverlappingPuzzle(
        overlappingPuzzle.topology,
        globalBoard,
        difficulty,
      )
      if (result.solved) {
        setGlobalBoard(result.board)
      }
      // Also log the first grid's human solve for debugging parity.
      const firstGrid = overlappingPuzzle.topology.grids[0]!
      const local = extractLocalBoard(globalBoard, firstGrid)
      const localResult = solveWithHumanTechniques([...local], { difficulty })
      logHumanSolveResult(localResult, difficulty)
      return
    }

    const result = solveWithHumanTechniques([...board], { difficulty })
    logHumanSolveResult(result, difficulty)

    if (result.solved) {
      setBoard([...result.board])
    }
  }

  const activeClues =
    mode === 'overlapping'
      ? overlappingPuzzle?.clues
      : puzzle?.clues
  const activeAttempts =
    mode === 'overlapping'
      ? overlappingPuzzle?.attempts.length
      : puzzle?.attempts.length
  const hasActivePuzzle =
    mode === 'overlapping' ? overlappingPuzzle !== null : puzzle !== null

  return (
    <main className="app">
      <header className="hero">
        <h1 className="title">
          Sudo<span className="accent">kapelago</span>
        </h1>
        <p className="tagline">
          A configurable Sudoku website with Archipelago multiworld integration.
        </p>
      </header>

      <section className="card" aria-labelledby="sudoku-board-title">
        <div className="setter-intro">
          <span className="eyebrow">Logical puzzle generation</span>
          <h2 id="sudoku-board-title">Human-solvable Sudoku setter</h2>
          <p>
            Every clue is tested once. A removal stays only when the selected
            techniques can solve the board from start to finish. Overlapping
            layouts keep shared boxes denser so uniqueness stays tractable.
          </p>
        </div>

        <OverlapControls
          gridCount={gridCount}
          mode={mode}
          onGridCountChange={setGridCount}
          onModeChange={setMode}
          onOverlapBoxesChange={setOverlapBoxes}
          overlapBoxes={overlapBoxes}
        />

        <div className="setter-controls">
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          <div className="setter-actions">
            <button
              className="generate-button"
              disabled={isGenerating}
              onClick={() => void generatePuzzle()}
              type="button"
            >
              {isGenerating
                ? 'Testing clue removals…'
                : mode === 'overlapping'
                  ? `Generate ${overlapBoxes}-box × ${gridCount}-grid ${difficulty} puzzle`
                  : `Generate ${difficulty} puzzle`}
            </button>
            <button
              className="debug-solve-button"
              onClick={debugSolve}
              type="button"
            >
              Debug solve with {difficulty} techniques
            </button>
          </div>
        </div>

        {generateError ? (
          <p className="puzzle-summary puzzle-summary--error" role="alert">
            {generateError}
          </p>
        ) : null}

        {hasActivePuzzle ? (
          <p className="puzzle-summary" role="status">
            <strong>{difficulty}</strong> puzzle · {activeClues} clues ·{' '}
            {activeAttempts} cells tested
            {mode === 'overlapping'
              ? ` · ${gridCount} grids · ${overlapBoxes}-box overlap`
              : null}
          </p>
        ) : (
          <p className="puzzle-summary" role="status">
            Choose a difficulty, then generate a puzzle.
          </p>
        )}

        <div
          className={
            mode === 'overlapping'
              ? 'board-stage board-stage--overlapping'
              : 'board-stage'
          }
        >
          {mode === 'overlapping' && overlappingPuzzle ? (
            <OverlappingSudokuBoard
              board={globalBoard}
              cornerCenterMode={effectiveCornerCenterMode}
              entryMode={entryMode}
              givenBoard={overlappingPuzzle.puzzle}
              onBoardChange={setGlobalBoard}
              topology={overlappingPuzzle.topology}
              pencilStyle={pencilStyle}
            />
          ) : mode === 'overlapping' ? (
            <p className="overlap-placeholder">
              Generate an overlapping puzzle to open the pan-and-zoom board.
            </p>
          ) : (
            <SudokuGrid
              board={board}
              cornerCenterMode={effectiveCornerCenterMode}
              entryMode={entryMode}
              givenCells={puzzle?.puzzle.map((value) => value !== 0)}
              onBoardChange={setBoard}
              onPencilBoardChange={setPencilBoard}
              pencilBoard={pencilBoard}
              pencilStyle={pencilStyle}
            />
          )}

          <EntryModeControls
            cornerCenterMode={effectiveCornerCenterMode}
            entryMode={entryMode}
            onCornerCenterModeChange={setCornerCenterMode}
            onEntryModeChange={setEntryMode}
            onPencilStyleChange={setPencilStyle}
            pencilStyle={pencilStyle}
          />
        </div>
      </section>

      <section className="status">
        <span
          className={archipelagoReady ? 'badge badge--ok' : 'badge badge--off'}
        >
          {archipelagoReady
            ? 'archipelago.js client initialized'
            : 'archipelago.js unavailable'}
        </span>
        <a href="https://archipelago.js.org/stable/" target="_blank" rel="noreferrer">
          archipelago.js docs
        </a>
      </section>
    </main>
  )
}

export default App
