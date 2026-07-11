import { Client } from 'archipelago.js'
import { useState } from 'react'
import './App.css'
import DifficultyPicker from './DifficultyPicker'
import SudokuGrid from './SudokuGrid'
import { createSudokuPuzzle } from './sudoku/setter'
import type { Difficulty, SudokuPuzzle } from './sudoku/types'

// A single shared Archipelago client. It is not connected to any server yet;
// this simply proves the archipelago.js integration is wired up and ready.
const archipelagoClient = new Client()

function App() {
  const archipelagoReady = archipelagoClient instanceof Client
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

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

        <div className="setter-controls">
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
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
        </div>

        {puzzle ? (
          <p className="puzzle-summary" role="status">
            <strong>{puzzle.difficulty}</strong> puzzle · {puzzle.clues} clues ·{' '}
            {puzzle.attempts.length} cells tested
          </p>
        ) : (
          <p className="puzzle-summary" role="status">
            Choose a difficulty, then generate a puzzle.
          </p>
        )}

        <SudokuGrid puzzle={puzzle?.puzzle} />
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
