import type { SectionStatus } from '../state/useStore'
import { useStore } from '../state/useStore'
import { strings } from './strings'

const BUTTON =
  'rounded border border-slate-300 bg-white px-2 py-1.5 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export function SectionControls() {
  const section = useStore((state) => state.section)
  const toggleMode = useStore((state) => state.toggleSectionMode)
  const clear = useStore((state) => state.clearSection)
  const removePoint = useStore((state) => state.removeSectionPoint)
  const setAppearance = useStore((state) => state.setSectionAppearance)

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        aria-pressed={section.enabled}
        onClick={toggleMode}
        className={
          section.enabled
            ? 'rounded border border-rose-400 bg-rose-50 px-2 py-1.5 text-sm text-rose-800'
            : BUTTON
        }
      >
        {section.enabled ? strings.section.disable : strings.section.enable}
      </button>

      <SectionHint
        status={section.status}
        enabled={section.enabled}
        hasPoints={section.points.length > 0}
        approximate={section.approximate}
      />

      {section.points.length > 0 && (
        <ol className="flex flex-col gap-1">
          {section.points.map((point, index) => (
            <li
              key={point.id}
              className="flex items-center justify-between gap-2 text-xs text-slate-600"
            >
              <span>
                {strings.section.point} {index + 1} ·{' '}
                {strings.section.hosts[point.host.kind]}
              </span>
              <button
                type="button"
                aria-label={`${strings.section.removePoint} ${index + 1}`}
                onClick={() => removePoint(point.id)}
                className="rounded px-1.5 py-0.5 text-rose-700 hover:bg-rose-50"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={clear}
        disabled={section.points.length === 0}
        className={BUTTON}
      >
        {strings.section.clear}
      </button>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-3">
        <ColorControl
          label={strings.section.appearance.color}
          value={section.appearance.color}
          onChange={(value) => setAppearance('color', value)}
        />
        <RangeControl
          label={strings.section.appearance.opacity}
          value={section.appearance.opacity}
          displayValue={`${Math.round(section.appearance.opacity * 100)}%`}
          min={0.05}
          max={0.9}
          step={0.05}
          onChange={(value) => setAppearance('opacity', value)}
        />
        <ColorControl
          label={strings.section.appearance.outlineColor}
          value={section.appearance.outlineColor}
          onChange={(value) => setAppearance('outlineColor', value)}
        />
        <RangeControl
          label={strings.section.appearance.outlineWidth}
          value={section.appearance.outlineWidth}
          displayValue={section.appearance.outlineWidth.toFixed(1)}
          min={1}
          max={8}
          step={0.5}
          onChange={(value) => setAppearance('outlineWidth', value)}
        />
        <ColorControl
          label={strings.section.appearance.labelColor}
          value={section.appearance.labelColor}
          onChange={(value) => setAppearance('labelColor', value)}
        />
        <RangeControl
          label={strings.section.appearance.labelSize}
          value={section.appearance.labelSize}
          displayValue={`${Math.round(section.appearance.labelSize * 100)}%`}
          min={0.5}
          max={2}
          step={0.1}
          onChange={(value) => setAppearance('labelSize', value)}
        />
      </div>
    </div>
  )
}

function SectionHint({
  status,
  enabled,
  hasPoints,
  approximate,
}: {
  status: SectionStatus
  enabled: boolean
  hasPoints: boolean
  approximate: boolean
}) {
  const hint =
    !enabled && hasPoints
      ? strings.section.hints.inactive
      : strings.section.hints[status]

  return (
    <div
      role={status === 'ready' ? 'status' : 'alert'}
      className="rounded bg-slate-100 px-2 py-1.5 text-xs leading-relaxed text-slate-600"
    >
      <p>{hint}</p>
      {approximate && status !== 'unsupported' && (
        <p className="mt-1 text-amber-700">
          {strings.section.hints.approximate}
        </p>
      )}
    </div>
  )
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-12 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
      />
    </label>
  )
}

function RangeControl({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  displayValue: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-baseline justify-between gap-3">
        <span>{label}</span>
        <span className="tabular-nums text-slate-500">{displayValue}</span>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
