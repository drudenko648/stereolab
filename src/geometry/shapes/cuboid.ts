import type { Solid } from '../types'
import { baseRingNames, topRingNames } from '../naming'
import { makeSolid, rv } from './util'

export interface CuboidParams {
  width: number
  height: number
  depth: number
}

/** Rectangular parallelepiped: same topology as the cube with independent sides. */
export function cuboid({ width, height, depth }: CuboidParams): Solid {
  const x = width / 2
  const y = height / 2
  const z = depth / 2
  const [a, b, c, d] = baseRingNames(4)
  const [a1, b1, c1, d1] = topRingNames(4)
  return makeSolid(
    'cuboid',
    [
      rv(a, -x, -y, z),
      rv(b, x, -y, z),
      rv(c, x, -y, -z),
      rv(d, -x, -y, -z),
      rv(a1, -x, y, z),
      rv(b1, x, y, z),
      rv(c1, x, y, -z),
      rv(d1, -x, y, -z),
    ],
    [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ],
    [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ],
  )
}
