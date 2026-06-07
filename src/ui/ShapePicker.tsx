import { SHAPE_DEFS } from '../geometry/shapes'
import type { ShapeType } from '../geometry/types'
import { useStore } from '../state/useStore'
import { strings } from './strings'

/** Dropdown to choose the active shape type. */
export function ShapePicker() {
  const shapeType = useStore((s) => s.shapeType)
  const setShape = useStore((s) => s.setShape)

  return (
    <select
      aria-label={strings.panel.shape}
      value={shapeType}
      onChange={(e) => setShape(e.target.value as ShapeType)}
      className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
    >
      {SHAPE_DEFS.map((def) => (
        <option key={def.type} value={def.type}>
          {strings.shapes[def.nameKey]}
        </option>
      ))}
    </select>
  )
}
