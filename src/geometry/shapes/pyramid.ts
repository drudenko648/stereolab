import type { Solid } from '../types'
import { APEX_PYRAMID, baseRingNames } from '../naming'
import { makeSolid, rv } from './util'

export interface PyramidParams {
  /** Side length of the square base. */
  baseSize: number
  height: number
}

/** Regular square pyramid: 5 vertices, 8 edges, 5 faces. Base ABCD, apex S. */
export function pyramid({ baseSize, height }: PyramidParams): Solid {
  const b = baseSize / 2
  const y = height / 2
  const [na, nb, nc, nd] = baseRingNames(4)
  return makeSolid(
    'pyramid',
    [
      rv(na, -b, -y, b),
      rv(nb, b, -y, b),
      rv(nc, b, -y, -b),
      rv(nd, -b, -y, -b),
      rv(APEX_PYRAMID, 0, y, 0),
    ],
    [
      [0, 1], [1, 2], [2, 3], [3, 0], // base ring
      [0, 4], [1, 4], [2, 4], [3, 4], // lateral edges to apex
    ],
    [
      [0, 1, 2, 3], // base
      [0, 1, 4],
      [1, 2, 4],
      [2, 3, 4],
      [3, 0, 4],
    ],
  )
}
