import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OverlapControls from '../../src/OverlapControls'

afterEach(() => {
  cleanup()
})

describe('OverlapControls', () => {
  it('switches between standard and overlapping modes', async () => {
    const user = userEvent.setup()
    const onModeChange = vi.fn()
    const onOverlapBoxesChange = vi.fn()
    const onGridCountChange = vi.fn()

    const { rerender } = render(
      <OverlapControls
        gridCount={6}
        mode="standard"
        onGridCountChange={onGridCountChange}
        onModeChange={onModeChange}
        onOverlapBoxesChange={onOverlapBoxesChange}
        overlapBoxes={1}
      />,
    )

    expect(screen.queryByLabelText('Box overlap')).toBeNull()

    await user.click(screen.getByRole('radio', { name: 'Overlapping' }))
    expect(onModeChange).toHaveBeenCalledWith('overlapping')

    rerender(
      <OverlapControls
        gridCount={6}
        mode="overlapping"
        onGridCountChange={onGridCountChange}
        onModeChange={onModeChange}
        onOverlapBoxesChange={onOverlapBoxesChange}
        overlapBoxes={1}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Box overlap'), '2')
    expect(onOverlapBoxesChange).toHaveBeenCalledWith(2)

    await user.clear(screen.getByLabelText('Grid count'))
    await user.type(screen.getByLabelText('Grid count'), '7')
    expect(onGridCountChange).toHaveBeenCalled()
  })
})
