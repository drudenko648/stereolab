import { describe, expect, it } from 'vitest'
import { characteristicLines } from '../../src/geometry/surface'

describe('curved-solid characteristic lines', () => {
  it('builds two circles and four generators for a cylinder', () => {
    const lines = characteristicLines({
      kind: 'revolved',
      bottomRadius: 2,
      topRadius: 2,
      height: 4,
      radialSegments: 16,
    })
    expect(lines).toHaveLength(6)
    expect(lines[0]).toHaveLength(17)
    expect(lines[0][0]).toEqual(lines[0][16])
    expect(lines.slice(2).every((line) => line.length === 2)).toBe(true)
  })

  it('omits the zero-radius top circle for a cone', () => {
    const lines = characteristicLines({
      kind: 'revolved',
      bottomRadius: 2,
      topRadius: 0,
      height: 4,
      radialSegments: 12,
    })
    expect(lines).toHaveLength(5)
  })

  it('builds three great circles for a sphere', () => {
    const lines = characteristicLines({
      kind: 'sphere',
      radius: 3,
      widthSegments: 20,
      heightSegments: 10,
    })
    expect(lines).toHaveLength(3)
    expect(lines.every((line) => line.length === 21)).toBe(true)
  })
})
