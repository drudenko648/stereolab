import { describe, expect, it } from 'vitest'
import type { Vec3 } from '../../src/geometry/types'
import { cube } from '../../src/geometry/shapes/cube'
import { cylinder } from '../../src/geometry/shapes/cylinder'
import { cone } from '../../src/geometry/shapes/cone'
import {
  intersectConvexMesh,
  orderOnPlane,
} from '../../src/geometry/section/intersect'
import { sectionMeshForSolid } from '../../src/geometry/section/mesh'
import { planeFromPoints } from '../../src/geometry/section/plane'

function plane(points: readonly Vec3[]) {
  const result = planeFromPoints(points)
  if (!result.ok) throw new Error(result.reason)
  return result.plane
}

function sortedCoordinates(points: readonly Vec3[]): string[] {
  return points
    .map((point) => point.map((value) => value.toFixed(6)).join(','))
    .sort()
}

describe('convex section intersection', () => {
  const mesh = sectionMeshForSolid(cube({ size: 2 }))
  if (!mesh) throw new Error('cube mesh missing')

  it('cuts a cube parallel to a face into an exact square', () => {
    const polygon = intersectConvexMesh(
      mesh,
      plane([
        [-1, 0, -1],
        [1, 0, -1],
        [1, 0, 1],
      ]),
    )
    expect(polygon).toHaveLength(4)
    expect(sortedCoordinates(polygon)).toEqual(
      sortedCoordinates([
        [-1, 0, -1],
        [-1, 0, 1],
        [1, 0, -1],
        [1, 0, 1],
      ]),
    )
  })

  it('cuts all six cube faces into an ordered hexagon', () => {
    const normalPlane = plane([
      [1, 0, -1],
      [1, -1, 0],
      [0, 1, -1],
    ])
    const polygon = intersectConvexMesh(mesh, normalPlane)
    expect(polygon).toHaveLength(6)
    expect(sortedCoordinates(polygon)).toEqual(
      sortedCoordinates([
        [1, 0, -1],
        [1, -1, 0],
        [0, 1, -1],
        [-1, 1, 0],
        [0, -1, 1],
        [-1, 0, 1],
      ]),
    )
    expectConsistentWinding(polygon, normalPlane.normal)
  })

  it('cuts a corner into a triangle', () => {
    const polygon = intersectConvexMesh(
      mesh,
      plane([
        [1, 1, 0],
        [1, 0, 1],
        [0, 1, 1],
      ]),
    )
    expect(polygon).toHaveLength(3)
  })

  it('returns an empty polygon when the plane misses the solid', () => {
    expect(
      intersectConvexMesh(
        mesh,
        plane([
          [3, 0, 0],
          [3, 1, 0],
          [3, 0, 1],
        ]),
      ),
    ).toEqual([])
  })

  it('tessellates revolved solids for approximate sections', () => {
    const cylinderMesh = sectionMeshForSolid(
      cylinder({ radius: 2, height: 4, segments: 24 }),
    )
    expect(cylinderMesh).not.toBeNull()
    if (!cylinderMesh) return
    expect(cylinderMesh.approximate).toBe(true)
    expect(cylinderMesh.vertices).toHaveLength(48)
    expect(cylinderMesh.faces).toHaveLength(26)

    const polygon = intersectConvexMesh(
      cylinderMesh,
      plane([
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 1],
      ]),
    )
    expect(polygon).toHaveLength(24)
  })

  it('uses one apex vertex for a tessellated cone', () => {
    const coneMesh = sectionMeshForSolid(
      cone({ radius: 2, height: 4, segments: 16 }),
    )
    expect(coneMesh).not.toBeNull()
    if (!coneMesh) return
    expect(coneMesh.vertices).toHaveLength(17)
    expect(coneMesh.edges).toHaveLength(32)
    expect(coneMesh.faces).toHaveLength(17)

    const polygon = intersectConvexMesh(
      coneMesh,
      plane([
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 1],
      ]),
    )
    expect(polygon).toHaveLength(16)
  })

  it('orders an unordered convex polygon without crossing edges', () => {
    const ordered = orderOnPlane(
      [
        [1, 0, 1],
        [-1, 0, -1],
        [-1, 0, 1],
        [1, 0, -1],
      ],
      [0, 1, 0],
    )
    expectConsistentWinding(ordered, [0, 1, 0])
  })
})

function expectConsistentWinding(points: readonly Vec3[], normal: Vec3): void {
  let expectedSign = 0
  for (let index = 0; index < points.length; index++) {
    const a = points[index]
    const b = points[(index + 1) % points.length]
    const c = points[(index + 2) % points.length]
    const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const bc: Vec3 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]]
    const turn: Vec3 = [
      ab[1] * bc[2] - ab[2] * bc[1],
      ab[2] * bc[0] - ab[0] * bc[2],
      ab[0] * bc[1] - ab[1] * bc[0],
    ]
    const signed =
      turn[0] * normal[0] + turn[1] * normal[1] + turn[2] * normal[2]
    const sign = Math.sign(signed)
    if (sign === 0) continue
    if (expectedSign === 0) expectedSign = sign
    expect(sign).toBe(expectedSign)
  }
  expect(expectedSign).not.toBe(0)
}
