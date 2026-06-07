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
    expect(get().viewNonce).toBe(1)
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

  it('updates every appearance setting', () => {
    get().setAppearance('figureColor', '#123456')
    get().setAppearance('faceOpacity', 0.4)
    get().setAppearance('edgeColor', '#abcdef')
    get().setAppearance('edgeWidth', 5)
    get().setAppearance('edgeStyle', 'dashed')
    get().setAppearance('vertexColor', '#fedcba')
    get().setAppearance('vertexSize', 0.14)
    get().setAppearance('labelColor', '#334455')

    expect(get().appearance).toEqual({
      figureColor: '#123456',
      faceOpacity: 0.4,
      edgeColor: '#abcdef',
      edgeWidth: 5,
      edgeStyle: 'dashed',
      vertexColor: '#fedcba',
      vertexSize: 0.14,
      labelColor: '#334455',
    })
  })

  it('renames vertices with validation and resets auto-naming', () => {
    expect(get().renameVertex(0, ' P ')).toEqual({ ok: true, value: 'P' })
    expect(get().vertexNamesByShape.cube).toEqual({ 0: 'P' })
    expect(get().renameVertex(1, 'P')).toEqual({
      ok: false,
      reason: 'duplicate',
    })
    expect(get().vertexNamesByShape.cube).toEqual({ 0: 'P' })

    get().resetVertexNames()
    expect(get().vertexNamesByShape.cube).toEqual({})
  })

  it('clears prism name overrides when the side count changes', () => {
    get().setShape('prism')
    get().renameVertex(0, 'P')
    expect(get().vertexNamesByShape.prism).toEqual({ 0: 'P' })
    get().setParam('sides', 5)
    expect(get().vertexNamesByShape.prism).toEqual({})
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
