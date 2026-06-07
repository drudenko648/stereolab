import { describe, expect, it } from 'vitest'
import type { Solid } from '../../src/geometry/types'
import { distance } from '../../src/geometry/math'
import { cube } from '../../src/geometry/shapes/cube'
import { cuboid } from '../../src/geometry/shapes/cuboid'
import { cylinder } from '../../src/geometry/shapes/cylinder'
import { cone } from '../../src/geometry/shapes/cone'
import { pyramid } from '../../src/geometry/shapes/pyramid'
import { prism } from '../../src/geometry/shapes/prism'
import { sphere } from '../../src/geometry/shapes/sphere'
import { tetrahedron } from '../../src/geometry/shapes/tetrahedron'
import { truncatedCone } from '../../src/geometry/shapes/truncatedCone'
import { truncatedPyramid } from '../../src/geometry/shapes/truncatedPyramid'
import { SHAPE_DEFS, generateSolid } from '../../src/geometry/shapes'

function byName(solid: Solid, name: string) {
  const v = solid.vertices.find((x) => x.name === name)
  if (!v) throw new Error(`vertex ${name} not found`)
  return v
}

function names(solid: Solid): string[] {
  return solid.vertices.map((v) => v.name)
}

function edgeLengths(solid: Solid): number[] {
  return solid.edges.map((e) =>
    distance(solid.vertices[e.a].position, solid.vertices[e.b].position),
  )
}

function extent(solid: Solid, axis: 0 | 1 | 2): number {
  const values = solid.vertices.map((v) => v.position[axis])
  return Math.max(...values) - Math.min(...values)
}

describe('cube', () => {
  const solid = cube({ size: 2 })

  it('has 8 vertices, 12 edges, 6 faces', () => {
    expect(solid.vertices).toHaveLength(8)
    expect(solid.edges).toHaveLength(12)
    expect(solid.faces).toHaveLength(6)
  })

  it('is centred with all edges equal to the side length', () => {
    expect(byName(solid, 'A').position).toEqual([-1, -1, 1])
    for (const len of edgeLengths(solid)) expect(len).toBeCloseTo(2)
  })

  it('names base ABCD and top A₁B₁C₁D₁', () => {
    expect(names(solid)).toEqual(['A', 'B', 'C', 'D', 'A₁', 'B₁', 'C₁', 'D₁'])
  })
})

describe('cuboid', () => {
  const solid = cuboid({ width: 3, height: 2, depth: 1.5 })

  it('has cube topology with independent extents', () => {
    expect(solid.vertices).toHaveLength(8)
    expect(solid.edges).toHaveLength(12)
    expect(solid.faces).toHaveLength(6)
    expect(extent(solid, 0)).toBeCloseTo(3)
    expect(extent(solid, 1)).toBeCloseTo(2)
    expect(extent(solid, 2)).toBeCloseTo(1.5)
  })
})

describe('pyramid', () => {
  const solid = pyramid({ baseSize: 2.5, height: 3 })

  it('has 5 vertices, 8 edges, 5 faces with apex S', () => {
    expect(solid.vertices).toHaveLength(5)
    expect(solid.edges).toHaveLength(8)
    expect(solid.faces).toHaveLength(5)
    expect(byName(solid, 'S').position).toEqual([0, 1.5, 0])
  })

  it('has its square base 1.5 below the centre', () => {
    for (const name of ['A', 'B', 'C', 'D']) {
      expect(byName(solid, name).position[1]).toBeCloseTo(-1.5)
    }
  })
})

describe('triangular prism', () => {
  const solid = prism({ base: 2.5, height: 3 })

  it('has 6 vertices, 9 edges, 5 faces', () => {
    expect(solid.vertices).toHaveLength(6)
    expect(solid.edges).toHaveLength(9)
    expect(solid.faces).toHaveLength(5)
  })

  it('names base ABC and top A₁B₁C₁', () => {
    expect(names(solid)).toEqual(['A', 'B', 'C', 'A₁', 'B₁', 'C₁'])
  })

  it('has base side 2.5 and lateral height 3', () => {
    // Vertical edges connect a base vertex to the one above it.
    const vertical = solid.edges.slice(6)
    for (const e of vertical) {
      expect(
        distance(solid.vertices[e.a].position, solid.vertices[e.b].position),
      ).toBeCloseTo(3)
    }
    const base = solid.edges.slice(0, 3)
    for (const e of base) {
      expect(
        distance(solid.vertices[e.a].position, solid.vertices[e.b].position),
      ).toBeCloseTo(2.5)
    }
  })
})

describe('general regular prism', () => {
  it.each([
    [4, 8, 12, 6],
    [5, 10, 15, 7],
    [8, 16, 24, 10],
  ])(
    'generates an n=%i prism with the expected topology',
    (sides, vertices, edges, faces) => {
      const solid = prism({ base: 2, height: 3, sides })
      expect(solid.vertices).toHaveLength(vertices)
      expect(solid.edges).toHaveLength(edges)
      expect(solid.faces).toHaveLength(faces)
      expect(solid.vertices[sides].name).toBe('A₁')
      for (const edge of solid.edges.slice(0, sides * 3)) {
        expect(edge.a).toBeLessThan(vertices)
        expect(edge.b).toBeLessThan(vertices)
      }
    },
  )

  it('rounds and clamps the side count to at least three', () => {
    expect(prism({ base: 2, height: 3, sides: 2 }).vertices).toHaveLength(6)
    expect(prism({ base: 2, height: 3, sides: 4.6 }).vertices).toHaveLength(10)
  })
})

describe('regular tetrahedron', () => {
  const solid = tetrahedron({ size: 3 })

  it('has 4 vertices, 6 edges, 4 faces', () => {
    expect(solid.vertices).toHaveLength(4)
    expect(solid.edges).toHaveLength(6)
    expect(solid.faces).toHaveLength(4)
  })

  it('names ABC plus apex D', () => {
    expect(names(solid)).toEqual(['A', 'B', 'C', 'D'])
  })

  it('is regular — all six edges equal', () => {
    for (const len of edgeLengths(solid)) expect(len).toBeCloseTo(3)
  })
})

describe('truncated pyramid', () => {
  const solid = truncatedPyramid({
    baseSize: 4,
    topRatio: 0.5,
    height: 3,
  })

  it('has 8 vertices, 12 edges and 6 faces', () => {
    expect(solid.vertices).toHaveLength(8)
    expect(solid.edges).toHaveLength(12)
    expect(solid.faces).toHaveLength(6)
  })

  it('uses a smaller, centred top square', () => {
    expect(byName(solid, 'A').position).toEqual([-2, -1.5, 2])
    expect(byName(solid, 'A₁').position).toEqual([-1, 1.5, 1])
    expect(names(solid)).toEqual(['A', 'B', 'C', 'D', 'A₁', 'B₁', 'C₁', 'D₁'])
  })
})

describe('curved solid hybrid models', () => {
  it('describes a cylinder with centres O/O₁ and an axis', () => {
    const solid = cylinder({ radius: 2, height: 4, segments: 24 })
    expect(names(solid)).toEqual(['O', 'O₁'])
    expect(solid.vertices.map((v) => v.position)).toEqual([
      [0, -2, 0],
      [0, 2, 0],
    ])
    expect(solid.edges).toEqual([{ a: 0, b: 1 }])
    expect(solid.faces).toEqual([])
    expect(solid.surface).toEqual({
      kind: 'revolved',
      bottomRadius: 2,
      topRadius: 2,
      height: 4,
      radialSegments: 24,
    })
  })

  it('describes a cone with base centre O and apex S', () => {
    const solid = cone({ radius: 1.5, height: 3, segments: 3 })
    expect(names(solid)).toEqual(['O', 'S'])
    expect(byName(solid, 'S').position).toEqual([0, 1.5, 0])
    expect(solid.surface).toMatchObject({
      kind: 'revolved',
      bottomRadius: 1.5,
      topRadius: 0,
      radialSegments: 8,
    })
  })

  it('describes a sphere with centre O and stable segment counts', () => {
    const solid = sphere({ radius: 2.25, segments: 30 })
    expect(names(solid)).toEqual(['O'])
    expect(solid.surface).toEqual({
      kind: 'sphere',
      radius: 2.25,
      widthSegments: 30,
      heightSegments: 15,
    })
  })

  it('describes a truncated cone with two centres and scaled top radius', () => {
    const solid = truncatedCone({
      radius: 2,
      topRatio: 0.4,
      height: 5,
      segments: 20,
    })
    expect(names(solid)).toEqual(['O', 'O₁'])
    expect(solid.surface).toMatchObject({
      kind: 'revolved',
      bottomRadius: 2,
      topRadius: 0.8,
      height: 5,
      radialSegments: 20,
    })
  })
})

describe('registry', () => {
  it('exposes exactly the ten product shapes', () => {
    expect(SHAPE_DEFS.map((d) => d.type)).toEqual([
      'cube',
      'cuboid',
      'pyramid',
      'prism',
      'tetrahedron',
      'cylinder',
      'cone',
      'sphere',
      'truncatedPyramid',
      'truncatedCone',
    ])
  })

  it('every default polyhedron satisfies Euler V − E + F = 2', () => {
    for (const def of SHAPE_DEFS) {
      const solid = generateSolid(def.type, def.defaults)
      if (solid.surface) continue
      expect(solid.vertices.length - solid.edges.length + solid.faces.length).toBe(2)
    }
  })
})
