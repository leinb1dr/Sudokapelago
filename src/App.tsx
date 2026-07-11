import { Client } from 'archipelago.js'
import './App.css'
import SudokuGrid from './SudokuGrid'

// A single shared Archipelago client. It is not connected to any server yet;
// this simply proves the archipelago.js integration is wired up and ready.
const archipelagoClient = new Client()

function App() {
  const archipelagoReady = archipelagoClient instanceof Client

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
        <h2 id="sudoku-board-title">Empty Sudoku board</h2>
        <p>
          Start from a clean 9x9 grid. Puzzle generation and Archipelago session
          handling will build on this first board view.
        </p>
        <SudokuGrid />
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
