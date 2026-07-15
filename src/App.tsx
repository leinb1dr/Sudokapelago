import { Client } from 'archipelago.js'
import { useEffect, useState } from 'react'
import './App.css'
import DifficultyPicker from './DifficultyPicker'
import EntryModeControls from './EntryModeControls'
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
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [pencilBoard, setPencilBoard] = useState<PencilBoard>(() =>
    createEmptyPencilBoard(),
  )
  const [entryMode, setEntryMode] = useState<EntryMode>('digit')
  const [pencilStyle, setPencilStyle] = useState<PencilStyle>('standard')
  const [cornerCenterMode, setCornerCenterMode] =
    useState<CornerCenterMode>('corner')
  const [isGenerating, setIsGenerating] = useState(false)
  const effectivePencilStyle = useEntryModeHotkeys({
    cornerCenterMode,
    entryMode,
    onCornerCenterModeChange: setCornerCenterMode,
    onEntryModeChange: setEntryMode,
    pencilStyle,
  })

  useEffect(() => {
    if (puzzle) {
      setBoard([...puzzle.puzzle])
      setPencilBoard(createEmptyPencilBoard())
    }
  }, [puzzle])

  async function generatePuzzle() {
    setIsGenerating(true)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
    setPuzzle(createSudokuPuzzle({ difficulty }))
    setIsGenerating(false)
  }

  function debugSolve() {
    const result = solveWithHumanTechniques([...board], { difficulty })
    logHumanSolveResult(result, difficulty)

    if (result.solved) {
      setBoard([...result.board])
    }
  }

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
            techniques can solve the board from start to finish.
          </p>
        </div>

        <div className="game-layout">
          <div className="control-panel">
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

            {puzzle ? (
              <p className="puzzle-summary" role="status">
                <strong>{puzzle.difficulty}</strong> puzzle · {puzzle.clues}{' '}
                clues · {puzzle.attempts.length} cells tested
              </p>
            ) : (
              <p className="puzzle-summary" role="status">
                Choose a difficulty, then generate a puzzle.
              </p>
            )}

            <EntryModeControls
              cornerCenterMode={cornerCenterMode}
              entryMode={entryMode}
              onCornerCenterModeChange={setCornerCenterMode}
              onEntryModeChange={setEntryMode}
              onPencilStyleChange={setPencilStyle}
              pencilStyle={effectivePencilStyle}
            />
          </div>

          <div className="game-layout__board">
            <SudokuGrid
              board={board}
              cornerCenterMode={cornerCenterMode}
              entryMode={entryMode}
              givenCells={puzzle?.puzzle.map((value) => value !== 0)}
              onBoardChange={setBoard}
              onPencilBoardChange={setPencilBoard}
              pencilBoard={pencilBoard}
              pencilStyle={effectivePencilStyle}
            />
          </div>
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
