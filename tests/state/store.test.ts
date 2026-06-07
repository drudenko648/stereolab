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
    expect(s.section).toMatchObject({
      enabled: false,
      draggingPoint: false,
      points: [],
      plane: null,
      polygon: [],
      status: 'needPoints',
      approximate: false,
      nextPointId: 1,
    })
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

  it('builds section state only after three valid constrained points', () => {
    get().toggleSectionMode()
    expect(get().section.enabled).toBe(true)

    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 4, t: 0.25 })
    expect(get().section.points).toHaveLength(2)
    expect(get().section.plane).toBeNull()
    expect(get().section.polygon).toEqual([])
    expect(get().section.status).toBe('needPoints')

    get().addSectionPoint({ kind: 'edge', edgeIndex: 9, t: 0.5 })
    expect(get().section.points).toHaveLength(3)
    expect(get().section.plane).not.toBeNull()
    expect(get().section.polygon).toHaveLength(4)
    expect(get().section.status).toBe('ready')
  })

  it('updates, removes, and clears section points', () => {
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 4, t: 0.25 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 9, t: 0.5 })
    const firstId = get().section.points[0].id

    get().updateSectionPoint(firstId, {
      kind: 'edge',
      edgeIndex: 0,
      t: 0.75,
    })
    expect(get().section.points[0].host).toEqual({
      kind: 'edge',
      edgeIndex: 0,
      t: 0.75,
    })
    expect(get().section.status).toBe('ready')

    get().removeSectionPoint(firstId)
    expect(get().section.points).toHaveLength(2)
    expect(get().section.status).toBe('needPoints')
    expect(get().section.polygon).toEqual([])

    get().clearSection()
    expect(get().section.points).toEqual([])
    expect(get().section.nextPointId).toBe(1)
  })

  it('keeps a completed section when editing mode exits', () => {
    get().toggleSectionMode()
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 4, t: 0.25 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 9, t: 0.5 })
    const polygon = get().section.polygon

    get().toggleSectionMode()
    expect(get().section.enabled).toBe(false)
    expect(get().section.polygon).toEqual(polygon)
  })

  it('tracks section-point dragging independently from section mode', () => {
    get().toggleSectionMode()
    get().setSectionPointDragging(true)
    expect(get().section.enabled).toBe(true)
    expect(get().section.draggingPoint).toBe(true)

    get().setSectionPointDragging(false)
    expect(get().section.draggingPoint).toBe(false)
  })

  it('reports coincident and collinear point sets without a polygon', () => {
    for (let index = 0; index < 3; index++) {
      get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    }
    expect(get().section.status).toBe('coincident')
    expect(get().section.polygon).toEqual([])

    get().clearSection()
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.2 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.8 })
    expect(get().section.status).toBe('collinear')
    expect(get().section.polygon).toEqual([])
  })

  it('clears stale hosts on shape or dimension changes', () => {
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    get().setParam('size', 3)
    expect(get().section.points).toEqual([])

    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    get().setShape('pyramid')
    expect(get().section.points).toEqual([])
  })

  it('marks curved sections approximate and sphere sections unsupported', () => {
    get().setShape('cylinder')
    get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
    expect(get().section.approximate).toBe(true)

    get().setShape('sphere')
    expect(get().section.status).toBe('unsupported')
    expect(get().section.points).toEqual([])
  })

  it('updates section appearance', () => {
    get().setSectionAppearance('color', '#112233')
    get().setSectionAppearance('opacity', 0.6)
    get().setSectionAppearance('outlineColor', '#445566')
    get().setSectionAppearance('outlineWidth', 5)
    expect(get().section.appearance).toEqual({
      color: '#112233',
      opacity: 0.6,
      outlineColor: '#445566',
      outlineWidth: 5,
    })
  })
})
