import type { Solid } from '../types'
import { CENTER, TOP_CENTER } from '../naming'
import { makeSolid, rv } from './util'

export interface TruncatedConeParams {
  radius: number
  topRatio: number
  height: number
  segments: number
}

/** Truncated cone hybrid model with base/top centres and its axis. */
export function truncatedCone({
  radius,
  topRatio,
  height,
  segments,
}: TruncatedConeParams): Solid {
  const y = height / 2
  return makeSolid(
    'truncatedCone',
    [rv(CENTER, 0, -y, 0), rv(TOP_CENTER, 0, y, 0)],
    [[0, 1]],
    [],
    {
      kind: 'revolved',
      bottomRadius: radius,
      topRadius: radius * topRatio,
      height,
      radialSegments: Math.max(8, Math.round(segments)),
    },
  )
}
