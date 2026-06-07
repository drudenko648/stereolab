// Pure geometry data model. No React, no Three.js — just plain data so the
// maths is fully unit-testable without a WebGL context.

/** A point or vector in 3D space (Three.js Y-up convention). */
export type Vec3 = readonly [number, number, number]

/** Shape types implemented in Stage 1. Extended in later stages. */
export type ShapeType = 'cube' | 'cuboid' | 'pyramid' | 'prism' | 'tetrahedron'

export interface Vertex {
  /** Index into Solid.vertices. */
  readonly id: number
  readonly position: Vec3
  /** Display name, e.g. "A", "B₁", "S". */
  readonly name: string
}

/** An undirected edge connecting two vertices by id. */
export interface Edge {
  readonly a: number
  readonly b: number
}

/** A flat polygonal face given as an ordered loop of vertex ids. */
export interface Face {
  readonly vertices: readonly number[]
}

/** A solid is the complete, framework-agnostic description of a shape. */
export interface Solid {
  readonly type: ShapeType
  readonly vertices: readonly Vertex[]
  readonly edges: readonly Edge[]
  readonly faces: readonly Face[]
}

/** Current numeric values for a shape's parameters, keyed by ParamSpec.key. */
export type ParamValues = Record<string, number>

/** Describes one adjustable dimension of a shape (drives the UI controls). */
export interface ParamSpec {
  readonly key: string
  /** Key into strings.params for the localised label. */
  readonly labelKey: string
  readonly min: number
  readonly max: number
  readonly step: number
  readonly default: number
}
