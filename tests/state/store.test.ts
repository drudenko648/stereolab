import { describe, expect, it } from 'vitest'
import { useStore } from '../../src/state/useStore'

const get = () => useStore.getState()

describe('store', () => {
  it('starts on the cube with everything visible', () => {
    const s = get()
    expect(s.shapeType).toBe('cube')
    expect(s.display).toEqual({
      faces: true,
      edges: true,
      vertices: true,
      labels: true,
    })
    expect(s.view).toBe('iso')
    expect(s.cameraLocked).toBe(false)
    expect(s.exportSettings).toEqual({ background: 'transparent', scale: 2 })
    expect(s.exportNonce).toBe(0)
  })

  it('switches shapes', () => {
    get().setShape('pyramid')
    expect(get().shapeType).toBe('pyramid')
  })

  it('updates params per shape and keeps them across switches', () => {
    get().setParam('size', 3.4) // current shape is cube
    expect(get().paramsByShape.cube.size).toBeCloseTo(3.4)

    get().setShape('pyramid')
    get().setParam('height', 4)
    expect(get().paramsByShape.pyramid.height).toBe(4)
    // The cube's edited size is untouched.
    expect(get().paramsByShape.cube.size).toBeCloseTo(3.4)

    get().setShape('cube')
    expect(get().paramsByShape.cube.size).toBeCloseTo(3.4)
  })

  it('toggles display flags independently', () => {
    get().toggleDisplay('faces')
    expect(get().display.faces).toBe(false)
    expect(get().display.edges).toBe(true)
  })

  it('bumps viewNonce on every view request, even repeats', () => {
    get().setView('top')
    expect(get().view).toBe('top')
    expect(get().viewNonce).toBe(1)
    get().setView('top')
    expect(get().viewNonce).toBe(2)
    get().resetView()
    expect(get().view).toBe('iso')
    expect(get().viewNonce).toBe(3)
  })

  it('toggles the camera lock', () => {
    expect(get().cameraLocked).toBe(false)
    get().toggleLock()
    expect(get().cameraLocked).toBe(true)
  })

  it('updates export settings and requests exports', () => {
    get().setExportBackground('white')
    get().setExportScale(4)
    expect(get().exportSettings).toEqual({ background: 'white', scale: 4 })
    get().requestExport()
    expect(get().exportNonce).toBe(1)
  })
})
