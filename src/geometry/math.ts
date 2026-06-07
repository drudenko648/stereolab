// Minimal pure vector helpers operating on Vec3 tuples. Kept independent of
// Three.js so the geometry layer has no rendering dependencies.
import type { Vec3 } from './types'

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function scale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s]
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

export function length(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2])
}

export function distance(a: Vec3, b: Vec3): number {
  return length(sub(a, b))
}

export function normalize(a: Vec3): Vec3 {
  const len = length(a)
  return len === 0 ? [0, 0, 0] : [a[0] / len, a[1] / len, a[2] / len]
}

/** Linear interpolation: a + t·(b − a). */
export function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
