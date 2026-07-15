import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EntryModeControls from '../../src/EntryModeControls'

afterEach(cleanup)

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

    expect(screen.queryByText('Pencil mark style')).toBeNull()
    expect(screen.queryByText('Corner or center')).toBeNull()

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

    expect(screen.getByText('Pencil mark style')).toBeTruthy()
    expect(screen.queryByText('Corner or center')).toBeNull()

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

    expect(screen.getByText('Corner or center')).toBeTruthy()
    await user.click(screen.getByRole('radio', { name: 'Center' }))
    expect(onCornerCenterModeChange).toHaveBeenCalledWith('center')
  })
})
