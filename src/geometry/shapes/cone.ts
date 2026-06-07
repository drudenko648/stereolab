import type { Solid } from '../types'
import { APEX_PYRAMID, CENTER } from '../naming'
import { makeSolid, rv } from './util'

export interface ConeParams {
  radius: number
  height: number
  segments: number
}

/** Cone hybrid model: parametric surface plus base centre O and apex S. */
export function cone({ radius, height, segments }: ConeParams): Solid {
  const y = height / 2
  return makeSolid(
    'cone',
    [rv(CENTER, 0, -y, 0), rv(APEX_PYRAMID, 0, y, 0)],
    [[0, 1]],
    [],
    {
      kind: 'revolved',
      bottomRadius: radius,
      topRadius: 0,
      height,
      radialSegments: Math.max(8, Math.round(segments)),
    },
  )
}
