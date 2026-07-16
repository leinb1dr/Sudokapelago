import './OverlapControls.css'
import {
  MAX_OVERLAPPING_GRIDS,
  type OverlapBoxes,
} from './sudoku/overlapping'

export type PuzzleMode = 'standard' | 'overlapping'

interface OverlapControlsProps {
  mode: PuzzleMode
  overlapBoxes: OverlapBoxes
  gridCount: number
  onModeChange: (mode: PuzzleMode) => void
  onOverlapBoxesChange: (overlapBoxes: OverlapBoxes) => void
  onGridCountChange: (gridCount: number) => void
}

const OVERLAP_OPTIONS: readonly OverlapBoxes[] = [1, 2, 3]

function OverlapControls({
  mode,
  overlapBoxes,
  gridCount,
  onModeChange,
  onOverlapBoxesChange,
  onGridCountChange,
}: OverlapControlsProps) {
  return (
    <div className="overlap-controls" aria-label="Puzzle layout">
      <div
        className="overlap-controls__modes"
        role="radiogroup"
        aria-label="Puzzle mode"
      >
        <label className="overlap-controls__option">
          <input
            checked={mode === 'standard'}
            name="puzzle-mode"
            onChange={() => {
              onModeChange('standard')
            }}
            type="radio"
            value="standard"
          />
          <span>Standard 9×9</span>
        </label>
        <label className="overlap-controls__option">
          <input
            checked={mode === 'overlapping'}
            name="puzzle-mode"
            onChange={() => {
              onModeChange('overlapping')
            }}
            type="radio"
            value="overlapping"
          />
          <span>Overlapping</span>
        </label>
      </div>

      {mode === 'overlapping' ? (
        <div className="overlap-controls__settings">
          <label className="overlap-controls__field">
            <span className="overlap-controls__label">Box overlap</span>
            <select
              aria-label="Box overlap"
              onChange={(event) => {
                onOverlapBoxesChange(Number(event.target.value) as OverlapBoxes)
              }}
              value={overlapBoxes}
            >
              {OVERLAP_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value} box{value === 1 ? '' : 'es'}
                </option>
              ))}
            </select>
          </label>

          <label className="overlap-controls__field">
            <span className="overlap-controls__label">
              Grids (1–{MAX_OVERLAPPING_GRIDS})
            </span>
            <input
              aria-label="Grid count"
              max={MAX_OVERLAPPING_GRIDS}
              min={2}
              onChange={(event) => {
                onGridCountChange(Number(event.target.value))
              }}
              type="number"
              value={gridCount}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}

export default OverlapControls
