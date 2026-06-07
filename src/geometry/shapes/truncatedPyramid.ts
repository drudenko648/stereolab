import type { Solid } from '../types'
import { baseRingNames, topRingNames } from '../naming'
import { makeSolid, rv } from './util'

export interface TruncatedPyramidParams {
  baseSize: number
  topRatio: number
  height: number
}

/** Regular square truncated pyramid with corresponding base/top vertices. */
export function truncatedPyramid({
  baseSize,
  topRatio,
  height,
}: TruncatedPyramidParams): Solid {
  const bottom = baseSize / 2
  const top = (baseSize * topRatio) / 2
  const y = height / 2
  const [a, b, c, d] = baseRingNames(4)
  const [a1, b1, c1, d1] = topRingNames(4)

  return makeSolid(
    'truncatedPyramid',
    [
      rv(a, -bottom, -y, bottom),
      rv(b, bottom, -y, bottom),
      rv(c, bottom, -y, -bottom),
      rv(d, -bottom, -y, -bottom),
      rv(a1, -top, y, top),
      rv(b1, top, y, top),
      rv(c1, top, y, -top),
      rv(d1, -top, y, -top),
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
