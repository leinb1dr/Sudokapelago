import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useEntryModeHotkeys from '../../src/useEntryModeHotkeys'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function dispatchKey(
  type: 'keydown' | 'keyup',
  key: string,
  init: KeyboardEventInit = {},
) {
  window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, ...init }))
}

describe('useEntryModeHotkeys', () => {
  it('toggles entry mode on Tab and corner/center mode on Control', () => {
    const onEntryModeChange = vi.fn()
    const onCornerCenterModeChange = vi.fn()

    const { result, rerender } = renderHook(
      (props) => useEntryModeHotkeys(props),
      {
        initialProps: {
          cornerCenterMode: 'corner' as const,
          entryMode: 'digit' as const,
          onCornerCenterModeChange,
          onEntryModeChange,
          pencilStyle: 'standard' as const,
        },
      },
    )

    expect(result.current).toBe('standard')

    act(() => {
      dispatchKey('keydown', 'Tab')
    })
    expect(onEntryModeChange).toHaveBeenCalledWith('pencil')

    rerender({
      cornerCenterMode: 'corner',
      entryMode: 'pencil',
      onCornerCenterModeChange,
      onEntryModeChange,
      pencilStyle: 'standard',
    })

    act(() => {
      dispatchKey('keydown', 'Control')
    })
    expect(onCornerCenterModeChange).toHaveBeenCalledWith('center')
  })

  it('temporarily flips pencil style while Shift is held', () => {
    const onEntryModeChange = vi.fn()
    const onCornerCenterModeChange = vi.fn()

    const { result } = renderHook(() =>
      useEntryModeHotkeys({
        cornerCenterMode: 'corner',
        entryMode: 'pencil',
        onCornerCenterModeChange,
        onEntryModeChange,
        pencilStyle: 'standard',
      }),
    )

    expect(result.current).toBe('standard')

    act(() => {
      dispatchKey('keydown', 'Shift')
    })
    expect(result.current).toBe('corner-center')

    act(() => {
      dispatchKey('keyup', 'Shift')
    })
    expect(result.current).toBe('standard')
  })

  it('clears the temporary Shift style when the window blurs', () => {
    const { result } = renderHook(() =>
      useEntryModeHotkeys({
        cornerCenterMode: 'corner',
        entryMode: 'pencil',
        onCornerCenterModeChange: vi.fn(),
        onEntryModeChange: vi.fn(),
        pencilStyle: 'corner-center',
      }),
    )

    act(() => {
      dispatchKey('keydown', 'Shift')
    })
    expect(result.current).toBe('standard')

    act(() => {
      window.dispatchEvent(new Event('blur'))
    })
    expect(result.current).toBe('corner-center')
  })

  it('ignores repeated Tab and Control keydown events', () => {
    const onEntryModeChange = vi.fn()
    const onCornerCenterModeChange = vi.fn()

    renderHook(() =>
      useEntryModeHotkeys({
        cornerCenterMode: 'corner',
        entryMode: 'digit',
        onCornerCenterModeChange,
        onEntryModeChange,
        pencilStyle: 'standard',
      }),
    )

    act(() => {
      dispatchKey('keydown', 'Tab', { repeat: true })
      dispatchKey('keydown', 'Control', { repeat: true })
    })

    expect(onEntryModeChange).not.toHaveBeenCalled()
    expect(onCornerCenterModeChange).not.toHaveBeenCalled()
  })

  it('prevents the default Tab focus change', () => {
    renderHook(() =>
      useEntryModeHotkeys({
        cornerCenterMode: 'corner',
        entryMode: 'digit',
        onCornerCenterModeChange: vi.fn(),
        onEntryModeChange: vi.fn(),
        pencilStyle: 'standard',
      }),
    )

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(event.defaultPrevented).toBe(true)
  })
})
