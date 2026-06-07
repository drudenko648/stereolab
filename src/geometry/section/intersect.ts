import {
  add,
  cross,
  distance,
  dot,
  lerp,
  normalize,
  scale,
} from '../math'
import type { Vec3 } from '../types'
import type { SectionMesh } from './mesh'
import { signedDistance, type SectionPlane } from './plane'

/**
 * Intersect a cutting plane with every boundary edge of a convex mesh, remove
 * numerical duplicates, then order the resulting convex polygon in-plane.
 */
export function intersectConvexMesh(
  mesh: SectionMesh,
  plane: SectionPlane,
  epsilon = 1e-7,
): Vec3[] {
  const points: Vec3[] = []

  for (const edge of mesh.edges) {
    const a = mesh.vertices[edge.a]
    const b = mesh.vertices[edge.b]
    const distanceA = signedDistance(plane, a)
    const distanceB = signedDistance(plane, b)
    const aOnPlane = Math.abs(distanceA) <= epsilon
    const bOnPlane = Math.abs(distanceB) <= epsilon

    if (aOnPlane) addUnique(points, a, epsilon)
    if (bOnPlane) addUnique(points, b, epsilon)

    if (
      (distanceA < -epsilon && distanceB > epsilon) ||
      (distanceA > epsilon && distanceB < -epsilon)
    ) {
      const t = distanceA / (distanceA - distanceB)
      addUnique(points, lerp(a, b, t), epsilon)
    }
  }

  if (points.length < 3) return []
  return orderOnPlane(points, plane.normal)
}

export function orderOnPlane(
  points: readonly Vec3[],
  normal: Vec3,
): Vec3[] {
  const centroid = scale(
    points.reduce<Vec3>((sum, point) => add(sum, point), [0, 0, 0]),
    1 / points.length,
  )
  const reference: Vec3 =
    Math.abs(normal[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0]
  const axisU = normalize(cross(normal, reference))
  const axisV = cross(normal, axisU)

  return [...points].sort((a, b) => {
    const relativeA = add(a, scale(centroid, -1))
    const relativeB = add(b, scale(centroid, -1))
    const angleA = Math.atan2(dot(relativeA, axisV), dot(relativeA, axisU))
    const angleB = Math.atan2(dot(relativeB, axisV), dot(relativeB, axisU))
    return angleA - angleB
  })
}

function addUnique(points: Vec3[], candidate: Vec3, epsilon: number): void {
  if (points.some((point) => distance(point, candidate) <= epsilon)) return
  points.push(candidate)
}
