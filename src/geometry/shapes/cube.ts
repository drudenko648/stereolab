import type { Solid } from '../types'
import { baseRingNames, topRingNames } from '../naming'
import { makeSolid, rv } from './util'

export interface CubeParams {
  /** Edge length. */
  size: number
}

/** Cube: 8 vertices, 12 edges, 6 faces. Base ABCD, top A₁B₁C₁D₁. */
export function cube({ size }: CubeParams): Solid {
  const h = size / 2
  const [a, b, c, d] = baseRingNames(4)
  const [a1, b1, c1, d1] = topRingNames(4)
  return makeSolid(
    'cube',
    [
      rv(a, -h, -h, h),
      rv(b, h, -h, h),
      rv(c, h, -h, -h),
      rv(d, -h, -h, -h),
      rv(a1, -h, h, h),
      rv(b1, h, h, h),
      rv(c1, h, h, -h),
      rv(d1, -h, h, -h),
    ],
    [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom ring
      [4, 5], [5, 6], [6, 7], [7, 4], // top ring
      [0, 4], [1, 5], [2, 6], [3, 7], // vertical edges
    ],
    [
      [0, 1, 2, 3], // bottom
      [4, 5, 6, 7], // top
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ],
  )
}
