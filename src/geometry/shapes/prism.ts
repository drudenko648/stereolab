import type { Solid } from '../types'
import { baseRingNames, topRingNames } from '../naming'
import { makeSolid, regularRing } from './util'

export interface PrismParams {
  /** Side length of the regular polygonal base. */
  base: number
  height: number
  sides?: number
}

/** General regular n-gon prism. Base ABC…, top A₁B₁C₁…. */
export function prism({ base, height, sides = 3 }: PrismParams): Solid {
  const n = Math.max(3, Math.round(sides))
  // Circumradius so the chord between adjacent vertices equals `base`.
  const r = base / (2 * Math.sin(Math.PI / n))
  const y = height / 2
  const bottom = regularRing(r, -y, n)
  const top = regularRing(r, y, n)
  const names = [...baseRingNames(n), ...topRingNames(n)]
  const vertices = [...bottom, ...top].map((position, i) => ({
    name: names[i],
    position,
  }))
  const edges: [number, number][] = []
  const faces: number[][] = [
    Array.from({ length: n }, (_, i) => i),
    Array.from({ length: n }, (_, i) => n + i),
  ]

  for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n])
  for (let i = 0; i < n; i++) edges.push([n + i, n + ((i + 1) % n)])
  for (let i = 0; i < n; i++) edges.push([i, n + i])
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    faces.push([i, next, n + next, n + i])
  }

  return makeSolid(
    'prism',
    vertices,
    edges,
    faces,
  )
}
