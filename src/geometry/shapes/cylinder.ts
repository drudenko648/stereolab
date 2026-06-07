import type { Solid } from '../types'
import { CENTER, TOP_CENTER } from '../naming'
import { makeSolid, rv } from './util'

export interface CylinderParams {
  radius: number
  height: number
  segments: number
}

/** Cylinder hybrid model: parametric surface plus centres and its axis. */
export function cylinder({
  radius,
  height,
  segments,
}: CylinderParams): Solid {
  const y = height / 2
  return makeSolid(
    'cylinder',
    [rv(CENTER, 0, -y, 0), rv(TOP_CENTER, 0, y, 0)],
    [[0, 1]],
    [],
    {
      kind: 'revolved',
      bottomRadius: radius,
      topRadius: radius,
      height,
      radialSegments: Math.max(8, Math.round(segments)),
    },
  )
}
