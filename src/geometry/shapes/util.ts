// Shared helpers for the shape generators. Every generator funnels through
// makeSolid so positioning and assembly are defined in exactly one place.
import type {
  Edge,
  Face,
  Solid,
  ShapeType,
  Surface,
  Vec3,
  Vertex,
} from '../types'

export interface RawVertex {
  readonly name: string
  readonly position: Vec3
}

/** Convenience constructor for a raw vertex from loose coordinates. */
export function rv(name: string, x: number, y: number, z: number): RawVertex {
  return { name, position: [x, y, z] }
}

/**
 * Assemble a Solid from raw vertices, edges and faces, recentring it on its
 * bounding-box centre at the origin. This is the single coordinate convention
 * for the whole app — change it here to e.g. sit a solid on the ground plane.
 */
export function makeSolid(
  type: ShapeType,
  rawVertices: readonly RawVertex[],
  edges: readonly (readonly [number, number])[],
  faces: readonly (readonly number[])[],
  surface?: Surface,
): Solid {
  const centered = centerOnBoundingBox(rawVertices.map((v) => v.position))
  const vertices: Vertex[] = rawVertices.map((v, i) => ({
    id: i,
    name: v.name,
    position: centered[i],
  }))
  const edgeList: Edge[] = edges.map(([a, b]) => ({ a, b }))
  const faceList: Face[] = faces.map((vs) => ({ vertices: [...vs] }))
  return { type, vertices, edges: edgeList, faces: faceList, surface }
}

/** Points of a regular n-gon in the horizontal XZ plane. */
export function regularRing(
  radius: number,
  y: number,
  sides: number,
): Vec3[] {
  return Array.from({ length: sides }, (_, i) => {
    const angle = Math.PI / 2 + (i * 2 * Math.PI) / sides
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)]
  })
}

/** Translate points so the centre of their axis-aligned bounding box is at 0. */
export function centerOnBoundingBox(points: readonly Vec3[]): Vec3[] {
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (const p of points) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], p[axis])
      max[axis] = Math.max(max[axis], p[axis])
    }
  }
  const center: Vec3 = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ]
  return points.map((p) => [
    p[0] - center[0],
    p[1] - center[1],
    p[2] - center[2],
  ])
}
