import { describe, expect, it } from 'vitest'
import type { Solid } from '../../src/geometry/types'
import { distance } from '../../src/geometry/math'
import { cube } from '../../src/geometry/shapes/cube'
import { cuboid } from '../../src/geometry/shapes/cuboid'
import { pyramid } from '../../src/geometry/shapes/pyramid'
import { prism } from '../../src/geometry/shapes/prism'
import { tetrahedron } from '../../src/geometry/shapes/tetrahedron'
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

describe('registry', () => {
  it('exposes exactly the five Stage 1 shapes', () => {
    expect(SHAPE_DEFS.map((d) => d.type)).toEqual([
      'cube',
      'cuboid',
      'pyramid',
      'prism',
      'tetrahedron',
    ])
  })

  it('every default solid satisfies Euler V − E + F = 2', () => {
    for (const def of SHAPE_DEFS) {
      const solid = generateSolid(def.type, def.defaults)
      expect(solid.vertices.length - solid.edges.length + solid.faces.length).toBe(2)
    }
  })
})
