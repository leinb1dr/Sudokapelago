import { beforeEach, describe, expect, it, vi } from 'vitest'

const rootMocks = vi.hoisted(() => ({
  createRoot: vi.fn(),
  render: vi.fn(),
}))

vi.mock('react-dom/client', () => ({
  createRoot: rootMocks.createRoot,
}))

vi.mock('archipelago.js', () => ({
  Client: class Client {},
}))

describe('application bootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    rootMocks.createRoot.mockReset()
    rootMocks.render.mockReset()
    rootMocks.createRoot.mockReturnValue({
      render: rootMocks.render,
      unmount: vi.fn(),
    })
    document.body.innerHTML = '<div id="root"></div>'
  })

  it('mounts the React application into the root element', async () => {
    const rootElement = document.getElementById('root')

    await import('../../src/main')

    expect(rootMocks.createRoot).toHaveBeenCalledWith(rootElement)
    expect(rootMocks.render).toHaveBeenCalledOnce()
  })
})
