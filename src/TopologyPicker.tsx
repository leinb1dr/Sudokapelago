import './TopologyPicker.css'
import { TOPOLOGIES, type TopologyId } from './sudoku/overlap'

const PLAYABLE_TOPOLOGIES: TopologyId[] = [
  'single',
  'two-grids-1-overlap',
  'six-grids-1-overlap',
  'seven-grids-2-overlap',
  'seven-grids-3-overlap-cross',
  'seven-grids-3-overlap-i',
]

interface TopologyPickerProps {
  value: TopologyId
  onChange: (topologyId: TopologyId) => void
  disabled?: boolean
}

function TopologyPicker({ value, onChange, disabled }: TopologyPickerProps) {
  return (
    <fieldset className="topology-picker" disabled={disabled}>
      <legend>Puzzle layout</legend>
      <div className="topology-picker__options" role="radiogroup" aria-label="Puzzle layout">
        {PLAYABLE_TOPOLOGIES.map((id) => {
          const topology = TOPOLOGIES[id]
          return (
            <label className="topology-picker__option" key={id}>
              <input
                checked={value === id}
                name="topology"
                onChange={() => {
                  onChange(id)
                }}
                type="radio"
                value={id}
              />
              <span>{topology.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default TopologyPicker
