import './DifficultyPicker.css'
import { DIFFICULTIES } from './sudoku/types'
import type { Difficulty } from './sudoku/types'

const DIFFICULTY_DETAILS: Readonly<
  Record<Difficulty, { label: string; techniques: string }>
> = {
  easy: {
    label: 'Easy',
    techniques: 'Singles and cross-hatching',
  },
  medium: {
    label: 'Medium',
    techniques: 'Locked candidates and subsets',
  },
  hard: {
    label: 'Hard',
    techniques: 'X-Wing and Y-Wing',
  },
  expert: {
    label: 'Expert',
    techniques: 'Swordfish and every lower tier',
  },
}

interface DifficultyPickerProps {
  value: Difficulty
  onChange: (difficulty: Difficulty) => void
}

function DifficultyPicker({ value, onChange }: DifficultyPickerProps) {
  return (
    <fieldset className="difficulty-picker">
      <legend>Maximum human technique</legend>
      <div className="difficulty-picker__options">
        {DIFFICULTIES.map((difficulty) => {
          const details = DIFFICULTY_DETAILS[difficulty]

          return (
            <label className="difficulty-picker__option" key={difficulty}>
              <input
                checked={value === difficulty}
                name="difficulty"
                onChange={() => {
                  onChange(difficulty)
                }}
                type="radio"
                value={difficulty}
              />
              <span>
                <strong>{details.label}</strong>
                <small>{details.techniques}</small>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default DifficultyPicker
