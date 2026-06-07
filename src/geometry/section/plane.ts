import { cross, dot, length, normalize, sub } from '../math'
import type { Vec3 } from '../types'

export interface SectionPlane {
  readonly normal: Vec3
  /** Plane equation: dot(normal, point) = constant. */
  readonly constant: number
}

export type PlaneError = 'tooFew' | 'coincident' | 'collinear'

export type PlaneResult =
  | { readonly ok: true; readonly plane: SectionPlane }
  | { readonly ok: false; readonly reason: PlaneError }

/**
 * Build a plane from the first non-collinear triple. Additional points remain
 * placement constraints but do not alter the plane in the Stage 3 model.
 */
export function planeFromPoints(
  points: readonly Vec3[],
  epsilon = 1e-8,
): PlaneResult {
  if (points.length < 3) return { ok: false, reason: 'tooFew' }

  const unique = deduplicate(points, epsilon)
  if (unique.length < 3) return { ok: false, reason: 'coincident' }

  for (let first = 0; first < unique.length - 2; first++) {
    for (let second = first + 1; second < unique.length - 1; second++) {
      for (let third = second + 1; third < unique.length; third++) {
        const rawNormal = cross(
          sub(unique[second], unique[first]),
          sub(unique[third], unique[first]),
        )
        if (length(rawNormal) <= epsilon) continue
        const normal = normalize(rawNormal)
        return {
          ok: true,
          plane: { normal, constant: dot(normal, unique[first]) },
        }
      }
    }
  }

  return { ok: false, reason: 'collinear' }
}

export function signedDistance(
  plane: SectionPlane,
  point: Vec3,
): number {
  return dot(plane.normal, point) - plane.constant
}

function deduplicate(points: readonly Vec3[], epsilon: number): Vec3[] {
  const epsilonSquared = epsilon * epsilon
  const unique: Vec3[] = []
  for (const point of points) {
    const duplicate = unique.some((candidate) => {
      const delta = sub(candidate, point)
      return dot(delta, delta) <= epsilonSquared
    })
    if (!duplicate) unique.push(point)
  }
  return unique
}
