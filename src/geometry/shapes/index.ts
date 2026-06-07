// Registry mapping each shape type to its generator and parameter schema.
// The UI and store are driven entirely by this data, so adding a shape later
// only means adding a generator and an entry here.
import type { ParamSpec, ParamValues, ShapeType, Solid } from '../types'
import { cube } from './cube'
import { cuboid } from './cuboid'
import { pyramid } from './pyramid'
import { prism } from './prism'
import { tetrahedron } from './tetrahedron'

export interface ShapeDef {
  readonly type: ShapeType
  /** Key into strings.shapes for the localised name. */
  readonly nameKey: ShapeType
  readonly params: readonly ParamSpec[]
  readonly defaults: ParamValues
  readonly generate: (params: ParamValues) => Solid
}

const LINEAR = { min: 0.5, max: 5, step: 0.1 } as const

function defaultsOf(params: readonly ParamSpec[]): ParamValues {
  return Object.fromEntries(params.map((p) => [p.key, p.default]))
}

function def(
  type: ShapeType,
  params: readonly ParamSpec[],
  generate: (params: ParamValues) => Solid,
): ShapeDef {
  return { type, nameKey: type, params, defaults: defaultsOf(params), generate }
}

export const SHAPE_DEFS: readonly ShapeDef[] = [
  def('cube', [{ key: 'size', labelKey: 'size', ...LINEAR, default: 2 }], (p) =>
    cube({ size: p.size }),
  ),
  def(
    'cuboid',
    [
      { key: 'width', labelKey: 'width', ...LINEAR, default: 3 },
      { key: 'height', labelKey: 'height', ...LINEAR, default: 2 },
      { key: 'depth', labelKey: 'depth', ...LINEAR, default: 1.5 },
    ],
    (p) => cuboid({ width: p.width, height: p.height, depth: p.depth }),
  ),
  def(
    'pyramid',
    [
      { key: 'baseSize', labelKey: 'baseSize', ...LINEAR, default: 2.5 },
      { key: 'height', labelKey: 'height', ...LINEAR, default: 3 },
    ],
    (p) => pyramid({ baseSize: p.baseSize, height: p.height }),
  ),
  def(
    'prism',
    [
      { key: 'base', labelKey: 'base', ...LINEAR, default: 2.5 },
      { key: 'height', labelKey: 'height', ...LINEAR, default: 3 },
    ],
    (p) => prism({ base: p.base, height: p.height }),
  ),
  def(
    'tetrahedron',
    [{ key: 'size', labelKey: 'size', ...LINEAR, default: 3 }],
    (p) => tetrahedron({ size: p.size }),
  ),
]

export const SHAPE_DEF_BY_TYPE: Record<ShapeType, ShapeDef> = Object.fromEntries(
  SHAPE_DEFS.map((d) => [d.type, d]),
) as Record<ShapeType, ShapeDef>

export const SHAPE_TYPES: readonly ShapeType[] = SHAPE_DEFS.map((d) => d.type)

/** Pure recompute of a solid from its type and parameter values. */
export function generateSolid(type: ShapeType, params: ParamValues): Solid {
  return SHAPE_DEF_BY_TYPE[type].generate(params)
}
