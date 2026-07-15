import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EntryModeControls from '../../src/EntryModeControls'

afterEach(cleanup)

describe('EntryModeControls', () => {
  it('keeps pencil options mounted and enables them only in pencil mode', async () => {
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

    const pencilStyleGroup = screen.getByText('Pencil style').closest('fieldset')
    const markTargetGroup = screen.getByText('Mark target').closest('fieldset')

    expect(pencilStyleGroup).toBeTruthy()
    expect(markTargetGroup).toBeTruthy()
    expect((pencilStyleGroup as HTMLFieldSetElement).disabled).toBe(true)
    expect((markTargetGroup as HTMLFieldSetElement).disabled).toBe(true)

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

    expect((pencilStyleGroup as HTMLFieldSetElement).disabled).toBe(false)
    expect((markTargetGroup as HTMLFieldSetElement).disabled).toBe(true)

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

    expect((markTargetGroup as HTMLFieldSetElement).disabled).toBe(false)
    await user.click(screen.getByRole('radio', { name: 'Center' }))
    expect(onCornerCenterModeChange).toHaveBeenCalledWith('center')
  })

  it('exposes a stable control region for layout pairing with the board', () => {
    render(
      <EntryModeControls
        cornerCenterMode="corner"
        entryMode="digit"
        onCornerCenterModeChange={vi.fn()}
        onEntryModeChange={vi.fn()}
        onPencilStyleChange={vi.fn()}
        pencilStyle="standard"
      />,
    )

    const region = screen.getByLabelText('Entry controls')
    expect(within(region).getAllByRole('group')).toHaveLength(3)
  })
})
