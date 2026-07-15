import './EntryModeControls.css'
import {
  CORNER_CENTER_MODES,
  ENTRY_MODES,
  PENCIL_STYLES,
  type CornerCenterMode,
  type EntryMode,
  type PencilStyle,
} from './sudoku/pencilMarks'

const ENTRY_MODE_LABELS: Readonly<Record<EntryMode, string>> = {
  digit: 'Number',
  pencil: 'Pencil',
}

const PENCIL_STYLE_LABELS: Readonly<Record<PencilStyle, string>> = {
  standard: 'Standard',
  'corner-center': 'Corner/Center',
}

const CORNER_CENTER_LABELS: Readonly<Record<CornerCenterMode, string>> = {
  corner: 'Corner',
  center: 'Center',
}

interface EntryModeControlsProps {
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
  onEntryModeChange: (mode: EntryMode) => void
  onPencilStyleChange: (style: PencilStyle) => void
  onCornerCenterModeChange: (mode: CornerCenterMode) => void
}

function EntryModeControls({
  entryMode,
  pencilStyle,
  cornerCenterMode,
  onEntryModeChange,
  onPencilStyleChange,
  onCornerCenterModeChange,
}: EntryModeControlsProps) {
  const showPencilStyle = entryMode === 'pencil'
  const showCornerCenter = showPencilStyle && pencilStyle === 'corner-center'

  return (
    <div className="entry-mode-controls">
      <fieldset className="entry-mode-controls__group">
        <legend>Entry mode</legend>
        <div className="entry-mode-controls__options">
          {ENTRY_MODES.map((mode) => (
            <label className="entry-mode-controls__option" key={mode}>
              <input
                checked={entryMode === mode}
                name="entry-mode"
                onChange={() => {
                  onEntryModeChange(mode)
                }}
                type="radio"
                value={mode}
              />
              <span>{ENTRY_MODE_LABELS[mode]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset
        className="entry-mode-controls__group"
        hidden={!showPencilStyle}
      >
        <legend>Pencil mark style</legend>
        <div className="entry-mode-controls__options">
          {PENCIL_STYLES.map((style) => (
            <label className="entry-mode-controls__option" key={style}>
              <input
                checked={pencilStyle === style}
                name="pencil-style"
                onChange={() => {
                  onPencilStyleChange(style)
                }}
                type="radio"
                value={style}
              />
              <span>{PENCIL_STYLE_LABELS[style]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset
        className="entry-mode-controls__group"
        hidden={!showCornerCenter}
      >
        <legend>Corner or center</legend>
        <div className="entry-mode-controls__options">
          {CORNER_CENTER_MODES.map((mode) => (
            <label className="entry-mode-controls__option" key={mode}>
              <input
                checked={cornerCenterMode === mode}
                name="corner-center-mode"
                onChange={() => {
                  onCornerCenterModeChange(mode)
                }}
                type="radio"
                value={mode}
              />
              <span>{CORNER_CENTER_LABELS[mode]}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default EntryModeControls
