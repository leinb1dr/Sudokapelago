import { useState } from 'react'
import { Client } from 'archipelago.js'
import './App.css'

// A single shared Archipelago client. It is not connected to any server yet;
// this simply proves the archipelago.js integration is wired up and ready.
const archipelagoClient = new Client()

function App() {
  const [greeted, setGreeted] = useState(false)

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

      <section className="card">
        <h2>Hello, world!</h2>
        <p>
          The TypeScript app is bootstrapped and running. From here we will build
          configurable Sudoku boards and connect them to Archipelago randomizer
          sessions.
        </p>
        <button type="button" onClick={() => setGreeted((v) => !v)}>
          {greeted ? 'Puzzle awaits...' : 'Say hello'}
        </button>
        {greeted && (
          <p className="greeting">Welcome to Sudokapelago!</p>
        )}
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
