import { describe, expect, it } from 'vitest'
import { cube } from '../../src/geometry/shapes/cube'
import {
  closestSegmentParameterToRay,
  edgeHostFromPoint,
  faceHostFromPoint,
  moveHostFromRay,
  resolveHostPoint,
} from '../../src/geometry/section/constraints'
import { sectionMeshForSolid } from '../../src/geometry/section/mesh'

describe('section point constraints', () => {
  const mesh = sectionMeshForSolid(cube({ size: 2 }))
  if (!mesh) throw new Error('cube mesh missing')

  it('projects to an edge and clamps t to its segment', () => {
    const host = edgeHostFromPoint(mesh, 0, [0.5, -1, 1])
    expect(host.t).toBeCloseTo(0.75)
    expect(resolveHostPoint(mesh, host)).toEqual([0.5, -1, 1])

    expect(
      resolveHostPoint(mesh, { kind: 'edge', edgeIndex: 0, t: -4 }),
    ).toEqual([-1, -1, 1])
    expect(
      resolveHostPoint(mesh, { kind: 'edge', edgeIndex: 0, t: 4 }),
    ).toEqual([1, -1, 1])
  })

  it('keeps a face point in its plane and clamps outside its polygon', () => {
    const inside = faceHostFromPoint(mesh, 1, [0.25, 1, -0.4])
    const resolvedInside = resolveHostPoint(mesh, inside)
    expect(resolvedInside[0]).toBeCloseTo(0.25)
    expect(resolvedInside[1]).toBeCloseTo(1)
    expect(resolvedInside[2]).toBeCloseTo(-0.4)

    const outside = faceHostFromPoint(mesh, 1, [10, 1, 10])
    const constrained = resolveHostPoint(mesh, outside)
    expect(constrained[1]).toBeCloseTo(1)
    expect(Math.abs(constrained[0])).toBeLessThanOrEqual(1)
    expect(Math.abs(constrained[2])).toBeLessThanOrEqual(1)
  })

  it('keeps vertex hosts fixed', () => {
    const host = { kind: 'vertex', vertexIndex: 3 } as const
    expect(resolveHostPoint(mesh, host)).toEqual([-1, -1, -1])
    expect(moveHostFromRay(mesh, host, [5, 5, 5], [-1, -1, -1])).toBe(host)
  })

  it('finds the closest constrained edge parameter while dragging', () => {
    expect(
      closestSegmentParameterToRay(
        [-1, 0, 0],
        [1, 0, 0],
        [0.4, 2, 1],
        [0, -1, -0.5],
      ),
    ).toBeCloseTo(0.7)
  })

  it('moves face hosts to the ray-plane intersection', () => {
    const initial = faceHostFromPoint(mesh, 1, [0, 1, 0])
    const moved = moveHostFromRay(mesh, initial, [0.5, 5, -0.25], [0, -1, 0])
    expect(resolveHostPoint(mesh, moved)).toEqual([0.5, 1, -0.25])
  })
})
