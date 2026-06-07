import type { Solid } from '../types'
import { baseRingNames, letterName } from '../naming'
import { makeSolid, rv } from './util'

export interface TetrahedronParams {
  /** Edge length of the regular tetrahedron. */
  size: number
}

/** Regular tetrahedron: 4 vertices, 6 edges, 4 faces. Base ABC, apex D. */
export function tetrahedron({ size }: TetrahedronParams): Solid {
  const r = size / Math.sqrt(3) // base circumradius → base side = size
  const apexHeight = size * Math.sqrt(2 / 3) // height of a regular tetrahedron
  const angle = (i: number) => Math.PI / 2 + (i * 2 * Math.PI) / 3
  const px = (i: number) => r * Math.cos(angle(i))
  const pz = (i: number) => r * Math.sin(angle(i))
  const [a, b, c] = baseRingNames(3)
  const d = letterName(3) // apex continues the base lettering: D
  // makeSolid recentres on the bounding box, so raw base-at-0 is fine.
  return makeSolid(
    'tetrahedron',
    [
      rv(a, px(0), 0, pz(0)),
      rv(b, px(1), 0, pz(1)),
      rv(c, px(2), 0, pz(2)),
      rv(d, 0, apexHeight, 0),
    ],
    [
      [0, 1], [1, 2], [2, 0], // base
      [0, 3], [1, 3], [2, 3], // edges to apex
    ],
    [
      [0, 1, 2], // base
      [0, 1, 3],
      [1, 2, 3],
      [2, 0, 3],
    ],
  )
}
