// Pure bounding helpers used for camera framing. Solids are centred on the
// origin, so the bounding radius is simply the farthest vertex distance.
import type { Solid } from './types'
import { length } from './math'

/** Radius of the smallest origin-centred sphere containing all vertices. */
export function boundingRadius(solid: Solid): number {
  if (solid.surface?.kind === 'sphere') return solid.surface.radius
  if (solid.surface?.kind === 'revolved') {
    const radius = Math.max(
      solid.surface.bottomRadius,
      solid.surface.topRadius,
    )
    return Math.hypot(radius, solid.surface.height / 2)
  }

  let max = 0
  for (const v of solid.vertices) {
    max = Math.max(max, length(v.position))
  }
  return max
}
