// Pure bounding helpers used for camera framing. Solids are centred on the
// origin, so the bounding radius is simply the farthest vertex distance.
import type { Solid } from './types'
import { length } from './math'

/** Radius of the smallest origin-centred sphere containing all vertices. */
export function boundingRadius(solid: Solid): number {
  let max = 0
  for (const v of solid.vertices) {
    max = Math.max(max, length(v.position))
  }
  return max
}
