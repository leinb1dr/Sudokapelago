import { useEffect, useRef, useState } from 'react'
import {
  toggleCornerCenterMode,
  toggleEntryMode,
  togglePencilStyle,
  type CornerCenterMode,
  type EntryMode,
  type PencilStyle,
} from './sudoku/pencilMarks'

interface UseEntryModeHotkeysOptions {
  entryMode: EntryMode
  pencilStyle: PencilStyle
  cornerCenterMode: CornerCenterMode
  onEntryModeChange: (mode: EntryMode) => void
  onCornerCenterModeChange: (mode: CornerCenterMode) => void
}

/**
 * Keyboard shortcuts for entry modes:
 * - Tab: toggle Number ↔ Pencil
 * - Control: toggle Corner ↔ Center
 * - Hold Shift: temporarily flip Standard ↔ Corner/Center
 */
function useEntryModeHotkeys({
  entryMode,
  pencilStyle,
  cornerCenterMode,
  onEntryModeChange,
  onCornerCenterModeChange,
}: UseEntryModeHotkeysOptions): PencilStyle {
  const [shiftHeld, setShiftHeld] = useState(false)
  const entryModeRef = useRef(entryMode)
  const cornerCenterModeRef = useRef(cornerCenterMode)
  const onEntryModeChangeRef = useRef(onEntryModeChange)
  const onCornerCenterModeChangeRef = useRef(onCornerCenterModeChange)

  entryModeRef.current = entryMode
  cornerCenterModeRef.current = cornerCenterMode
  onEntryModeChangeRef.current = onEntryModeChange
  onCornerCenterModeChangeRef.current = onCornerCenterModeChange

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        event.preventDefault()
        if (!event.repeat) {
          onEntryModeChangeRef.current(toggleEntryMode(entryModeRef.current))
        }
        return
      }

      if (event.key === 'Control') {
        if (!event.repeat) {
          onCornerCenterModeChangeRef.current(
            toggleCornerCenterMode(cornerCenterModeRef.current),
          )
        }
        return
      }

      if (event.key === 'Shift' && !event.repeat) {
        setShiftHeld(true)
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Shift') {
        setShiftHeld(false)
      }
    }

    function clearShiftHeld() {
      setShiftHeld(false)
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('blur', clearShiftHeld)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('blur', clearShiftHeld)
    }
  }, [])

  return shiftHeld ? togglePencilStyle(pencilStyle) : pencilStyle
}

export default useEntryModeHotkeys
