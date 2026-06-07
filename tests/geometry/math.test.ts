import { describe, expect, it } from 'vitest'
import {
  add,
  clamp,
  cross,
  distance,
  dot,
  length,
  lerp,
  normalize,
  scale,
  sub,
} from '../../src/geometry/math'

describe('vector math', () => {
  it('adds and subtracts componentwise', () => {
    expect(add([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9])
    expect(sub([4, 5, 6], [1, 2, 3])).toEqual([3, 3, 3])
  })

  it('scales and dots', () => {
    expect(scale([1, -2, 3], 2)).toEqual([2, -4, 6])
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
  })

  it('computes the right-handed cross product', () => {
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1])
    expect(cross([0, 1, 0], [0, 0, 1])).toEqual([1, 0, 0])
  })

  it('computes length and distance', () => {
    expect(length([3, 4, 0])).toBe(5)
    expect(distance([0, 0, 0], [0, 3, 4])).toBe(5)
  })

  it('normalizes (and is safe at zero)', () => {
    expect(normalize([0, 5, 0])).toEqual([0, 1, 0])
    expect(normalize([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('interpolates linearly', () => {
    expect(lerp([0, 0, 0], [2, 2, 2], 0.5)).toEqual([1, 1, 1])
    expect(lerp([0, 0, 0], [10, 0, 0], 0.25)).toEqual([2.5, 0, 0])
  })

  it('clamps scalar values', () => {
    expect(clamp(-2, 0, 1)).toBe(0)
    expect(clamp(0.4, 0, 1)).toBe(0.4)
    expect(clamp(3, 0, 1)).toBe(1)
  })
})
