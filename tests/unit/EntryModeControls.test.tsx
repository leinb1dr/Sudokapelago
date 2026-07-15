import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EntryModeControls from '../../src/EntryModeControls'

afterEach(cleanup)

function fieldsetForLegend(label: string): HTMLFieldSetElement {
  const legend = screen.getByText(label)
  const fieldset = legend.closest('fieldset')
  expect(fieldset).toBeTruthy()
  return fieldset as HTMLFieldSetElement
}

describe('EntryModeControls', () => {
  it('shows pencil style options only in pencil mode', async () => {
    const user = userEvent.setup()
    const onEntryModeChange = vi.fn()
    const onPencilStyleChange = vi.fn()
    const onCornerCenterModeChange = vi.fn()

    const { rerender } = render(
      <EntryModeControls
        cornerCenterMode="corner"
        entryMode="digit"
        onCornerCenterModeChange={onCornerCenterModeChange}
        onEntryModeChange={onEntryModeChange}
        onPencilStyleChange={onPencilStyleChange}
        pencilStyle="standard"
      />,
    )

    expect(fieldsetForLegend('Pencil mark style').hidden).toBe(true)
    expect(fieldsetForLegend('Corner or center').hidden).toBe(true)

    await user.click(screen.getByRole('radio', { name: 'Pencil' }))
    expect(onEntryModeChange).toHaveBeenCalledWith('pencil')

    rerender(
      <EntryModeControls
        cornerCenterMode="corner"
        entryMode="pencil"
        onCornerCenterModeChange={onCornerCenterModeChange}
        onEntryModeChange={onEntryModeChange}
        onPencilStyleChange={onPencilStyleChange}
        pencilStyle="standard"
      />,
    )

    expect(fieldsetForLegend('Pencil mark style').hidden).toBe(false)
    expect(fieldsetForLegend('Corner or center').hidden).toBe(true)

    await user.click(screen.getByRole('radio', { name: 'Corner/Center' }))
    expect(onPencilStyleChange).toHaveBeenCalledWith('corner-center')

    rerender(
      <EntryModeControls
        cornerCenterMode="corner"
        entryMode="pencil"
        onCornerCenterModeChange={onCornerCenterModeChange}
        onEntryModeChange={onEntryModeChange}
        onPencilStyleChange={onPencilStyleChange}
        pencilStyle="corner-center"
      />,
    )

    expect(fieldsetForLegend('Corner or center').hidden).toBe(false)
    await user.click(screen.getByRole('radio', { name: 'Center' }))
    expect(onCornerCenterModeChange).toHaveBeenCalledWith('center')
  })
})
