import type { Solid } from '../types'
import { baseRingNames, topRingNames } from '../naming'
import { makeSolid, rv } from './util'

export interface PrismParams {
  /** Side length of the equilateral triangular base. */
  base: number
  height: number
}

/** Triangular prism: 6 vertices, 9 edges, 5 faces. Base ABC, top A₁B₁C₁. */
export function prism({ base, height }: PrismParams): Solid {
  // Circumradius so the chord between adjacent vertices equals `base`.
  const r = base / Math.sqrt(3)
  const y = height / 2
  // First vertex points towards +Z; the rest are spaced 120° apart.
  const angle = (i: number) => Math.PI / 2 + (i * 2 * Math.PI) / 3
  const px = (i: number) => r * Math.cos(angle(i))
  const pz = (i: number) => r * Math.sin(angle(i))
  const [a, b, c] = baseRingNames(3)
  const [a1, b1, c1] = topRingNames(3)
  return makeSolid(
    'prism',
    [
      rv(a, px(0), -y, pz(0)),
      rv(b, px(1), -y, pz(1)),
      rv(c, px(2), -y, pz(2)),
      rv(a1, px(0), y, pz(0)),
      rv(b1, px(1), y, pz(1)),
      rv(c1, px(2), y, pz(2)),
    ],
    [
      [0, 1], [1, 2], [2, 0], // bottom triangle
      [3, 4], [4, 5], [5, 3], // top triangle
      [0, 3], [1, 4], [2, 5], // vertical edges
    ],
    [
      [0, 1, 2], // bottom
      [3, 4, 5], // top
      [0, 1, 4, 3],
      [1, 2, 5, 4],
      [2, 0, 3, 5],
    ],
  )
}
