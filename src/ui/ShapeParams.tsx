import { SHAPE_DEF_BY_TYPE } from '../geometry/shapes'
import { useStore } from '../state/useStore'
import { strings } from './strings'

/** Sliders for the current shape's dimensions, driven by its param schema. */
export function ShapeParams() {
  const shapeType = useStore((s) => s.shapeType)
  const params = useStore((s) => s.paramsByShape[s.shapeType])
  const setParam = useStore((s) => s.setParam)
  const specs = SHAPE_DEF_BY_TYPE[shapeType].params

  return (
    <div className="flex flex-col gap-3">
      {specs.map((spec) => {
        const value = params[spec.key]
        const label =
          strings.params[spec.labelKey as keyof typeof strings.params]
        return (
          <label key={spec.key} className="flex flex-col gap-1 text-sm">
            <span className="flex items-baseline justify-between">
              <span>{label}</span>
              <span className="tabular-nums text-slate-500">
                {value.toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={value}
              aria-label={label}
              onChange={(e) => setParam(spec.key, Number(e.target.value))}
            />
          </label>
        )
      })}
    </div>
  )
}
