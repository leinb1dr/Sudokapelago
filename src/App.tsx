import { Client } from 'archipelago.js'
import { useCallback, useEffect, useState } from 'react'
import './App.css'
import DifficultyPicker from './DifficultyPicker'
import EntryModeControls from './EntryModeControls'
import OverlappingSudokuBoard, {
  OVERLAP_CELL_PX,
} from './OverlappingSudokuBoard'
import PuzzleMinimap from './PuzzleMinimap'
import PuzzleViewport, { type ViewportRect } from './PuzzleViewport'
import SudokuGrid from './SudokuGrid'
import TopologyPicker from './TopologyPicker'
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
  createOverlappingSudokuPuzzleAsync,
  createWorkerFillFn,
  solveOverlappingWithHumanTechniques,
  type GlobalBoard,
  type OverlappingSudokuPuzzle,
  type TopologyId,
} from './sudoku/overlap'
import type { Board, Difficulty, SudokuPuzzle } from './sudoku/types'
import useEntryModeHotkeys from './useEntryModeHotkeys'

// A single shared Archipelago client. It is not connected to any server yet;
// this simply proves the archipelago.js integration is wired up and ready.
const archipelagoClient = new Client()
const workerFill = createWorkerFillFn()

function createEmptyBoard(): Board {
  return Array<Board[number]>(CELL_COUNT).fill(0)
}

function App() {
  const archipelagoReady = archipelagoClient instanceof Client
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [topologyId, setTopologyId] = useState<TopologyId>('single')
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [overlapPuzzle, setOverlapPuzzle] =
    useState<OverlappingSudokuPuzzle | null>(null)
  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [globalBoard, setGlobalBoard] = useState<GlobalBoard | null>(null)
  const [pencilBoard, setPencilBoard] = useState<PencilBoard>(() =>
    createEmptyPencilBoard(),
  )
  const [entryMode, setEntryMode] = useState<EntryMode>('digit')
  const [pencilStyle, setPencilStyle] = useState<PencilStyle>('standard')
  const [cornerCenterMode, setCornerCenterMode] =
    useState<CornerCenterMode>('corner')
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewport, setViewport] = useState<ViewportRect | null>(null)
  const effectiveCornerCenterMode = useEntryModeHotkeys({
    cornerCenterMode,
    entryMode,
    onCornerCenterModeChange: setCornerCenterMode,
    onEntryModeChange: setEntryMode,
  })

  const isOverlapMode = topologyId !== 'single'

  useEffect(() => {
    if (puzzle && !isOverlapMode) {
      setBoard([...puzzle.puzzle])
      setPencilBoard(createEmptyPencilBoard())
    }
  }, [puzzle, isOverlapMode])

  useEffect(() => {
    if (overlapPuzzle && isOverlapMode) {
      setGlobalBoard([...overlapPuzzle.puzzle])
      setPencilBoard(
        createEmptyPencilBoard(
          overlapPuzzle.graph.bounds.rows * overlapPuzzle.graph.bounds.cols,
        ),
      )
    }
  }, [overlapPuzzle, isOverlapMode])

  const handleViewportChange = useCallback((next: ViewportRect) => {
    setViewport(next)
  }, [])

  async function generatePuzzle() {
    setIsGenerating(true)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    })

    try {
      if (topologyId === 'single') {
        setOverlapPuzzle(null)
        setGlobalBoard(null)
        setPuzzle(createSudokuPuzzle({ difficulty }))
      } else {
        setPuzzle(null)
        setBoard(createEmptyBoard())
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 0)
        })
        const generated = await createOverlappingSudokuPuzzleAsync({
          topologyId,
          difficulty,
          seed: Date.now() % 1_000_000,
          asyncFillGrid: workerFill,
        })
        setOverlapPuzzle(generated)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  function debugSolve() {
    if (isOverlapMode && overlapPuzzle && globalBoard) {
      const result = solveOverlappingWithHumanTechniques(
        globalBoard,
        overlapPuzzle.graph,
        { difficulty },
      )
      for (const [gridId, gridResult] of Object.entries(result.gridResults)) {
        console.info(`[overlap:${gridId}]`)
        logHumanSolveResult(gridResult, difficulty)
      }
      if (result.solved) {
        setGlobalBoard([...result.board])
      }
      return
    }

    const result = solveWithHumanTechniques([...board], { difficulty })
    logHumanSolveResult(result, difficulty)

    if (result.solved) {
      setBoard([...result.board])
    }
  }

  const contentWidth = overlapPuzzle
    ? overlapPuzzle.graph.bounds.cols * OVERLAP_CELL_PX
    : 0
  const contentHeight = overlapPuzzle
    ? overlapPuzzle.graph.bounds.rows * OVERLAP_CELL_PX
    : 0

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
            layouts share cells in a global coordinate space and protect
            junction clues while stripping the outer regions first.
          </p>
        </div>

        <div className="setter-controls">
          <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          <TopologyPicker
            disabled={isGenerating}
            onChange={setTopologyId}
            value={topologyId}
          />
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
        </div>

        {isOverlapMode && overlapPuzzle ? (
          <p className="puzzle-summary" role="status">
            <strong>{overlapPuzzle.difficulty}</strong> ·{' '}
            {overlapPuzzle.graph.nodes.length} grids · {overlapPuzzle.clues}{' '}
            clues · {overlapPuzzle.overlapCellCount} overlap cells ·{' '}
            {overlapPuzzle.attempts.length} cells tested
          </p>
        ) : puzzle ? (
          <p className="puzzle-summary" role="status">
            <strong>{puzzle.difficulty}</strong> puzzle · {puzzle.clues} clues ·{' '}
            {puzzle.attempts.length} cells tested
          </p>
        ) : (
          <p className="puzzle-summary" role="status">
            Choose a difficulty and layout, then generate a puzzle.
          </p>
        )}

        <div className={`board-stage${isOverlapMode ? ' board-stage--overlap' : ''}`}>
          {isOverlapMode && overlapPuzzle && globalBoard ? (
            <div className="overlap-stage">
              <PuzzleViewport
                aria-label="Overlapping puzzle viewport"
                contentHeight={contentHeight}
                contentWidth={contentWidth}
                onViewportChange={handleViewportChange}
              >
                <OverlappingSudokuBoard
                  board={globalBoard}
                  cornerCenterMode={effectiveCornerCenterMode}
                  entryMode={entryMode}
                  givenBoard={overlapPuzzle.puzzle}
                  graph={overlapPuzzle.graph}
                  onBoardChange={setGlobalBoard}
                  onPencilBoardChange={setPencilBoard}
                  pencilBoard={pencilBoard}
                  pencilStyle={pencilStyle}
                />
              </PuzzleViewport>
              <PuzzleMinimap
                graph={overlapPuzzle.graph}
                viewport={viewport}
              />
            </div>
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
