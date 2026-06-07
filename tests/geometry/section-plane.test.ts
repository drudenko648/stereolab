import { describe, expect, it } from 'vitest'
import {
  planeFromPoints,
  signedDistance,
} from '../../src/geometry/section/plane'

describe('section plane', () => {
  it('builds a normalized plane through three points', () => {
    const result = planeFromPoints([
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(Math.abs(result.plane.normal[1])).toBeCloseTo(1)
    expect(signedDistance(result.plane, [2, 0, -4])).toBeCloseTo(0)
    expect(Math.abs(signedDistance(result.plane, [0, 2, 0]))).toBeCloseTo(2)
  })

  it('rejects fewer than three, coincident, and collinear points', () => {
    expect(planeFromPoints([[0, 0, 0], [1, 0, 0]])).toEqual({
      ok: false,
      reason: 'tooFew',
    })
    expect(
      planeFromPoints([
        [0, 0, 0],
        [0, 0, 0],
        [1, 0, 0],
      ]),
    ).toEqual({ ok: false, reason: 'coincident' })
    expect(
      planeFromPoints([
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],
      ]),
    ).toEqual({ ok: false, reason: 'collinear' })
  })

  it('uses the first non-collinear triple when extra constraints exist', () => {
    const result = planeFromPoints([
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [0, 0, 1],
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(signedDistance(result.plane, [0.25, 0, 0.25])).toBeCloseTo(0)
  })
})
