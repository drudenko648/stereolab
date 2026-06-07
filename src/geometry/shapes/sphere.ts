import type { Solid } from '../types'
import { CENTER } from '../naming'
import { makeSolid, rv } from './util'

export interface SphereParams {
  radius: number
  segments: number
}

/** Sphere hybrid model with centre O as its characteristic point. */
export function sphere({ radius, segments }: SphereParams): Solid {
  const widthSegments = Math.max(8, Math.round(segments))
  return makeSolid('sphere', [rv(CENTER, 0, 0, 0)], [], [], {
    kind: 'sphere',
    radius,
    widthSegments,
    heightSegments: Math.max(6, Math.round(widthSegments / 2)),
  })
}
