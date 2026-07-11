import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DifficultyPicker from '../../src/DifficultyPicker'

afterEach(cleanup)

describe('DifficultyPicker', () => {
  it('renders every tier and reports the selected difficulty', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DifficultyPicker value="easy" onChange={onChange} />)

    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(
      (screen.getByRole('radio', { name: /Easy/ }) as HTMLInputElement)
        .checked,
    ).toBe(true)

    await user.click(screen.getByRole('radio', { name: /Hard/ }))
    expect(onChange).toHaveBeenCalledWith('hard')
  })
})
