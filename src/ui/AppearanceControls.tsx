import type { EdgeStyle } from '../state/useStore'
import { useStore } from '../state/useStore'
import { strings } from './strings'

interface RangeControlProps {
  label: string
  value: number
  displayValue: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function RangeControl({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: RangeControlProps) {
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

/** Complete Stage 2 styling controls for faces, edges, points and labels. */
export function AppearanceControls() {
  const appearance = useStore((state) => state.appearance)
  const setAppearance = useStore((state) => state.setAppearance)

  return (
    <div className="flex flex-col gap-3">
      <ColorControl
        label={strings.appearance.figureColor}
        value={appearance.figureColor}
        onChange={(value) => setAppearance('figureColor', value)}
      />
      <RangeControl
        label={strings.appearance.faceOpacity}
        value={appearance.faceOpacity}
        displayValue={`${Math.round(appearance.faceOpacity * 100)}%`}
        min={0.05}
        max={1}
        step={0.05}
        onChange={(value) => setAppearance('faceOpacity', value)}
      />
      <ColorControl
        label={strings.appearance.edgeColor}
        value={appearance.edgeColor}
        onChange={(value) => setAppearance('edgeColor', value)}
      />
      <RangeControl
        label={strings.appearance.edgeWidth}
        value={appearance.edgeWidth}
        displayValue={appearance.edgeWidth.toFixed(1)}
        min={0.5}
        max={8}
        step={0.5}
        onChange={(value) => setAppearance('edgeWidth', value)}
      />
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>{strings.appearance.edgeStyle}</span>
        <select
          aria-label={strings.appearance.edgeStyle}
          value={appearance.edgeStyle}
          onChange={(event) =>
            setAppearance('edgeStyle', event.target.value as EdgeStyle)
          }
          className="rounded border border-slate-300 bg-white px-2 py-1"
        >
          <option value="solid">{strings.appearance.solid}</option>
          <option value="dashed">{strings.appearance.dashed}</option>
        </select>
      </label>
      <ColorControl
        label={strings.appearance.vertexColor}
        value={appearance.vertexColor}
        onChange={(value) => setAppearance('vertexColor', value)}
      />
      <RangeControl
        label={strings.appearance.vertexSize}
        value={appearance.vertexSize}
        displayValue={appearance.vertexSize.toFixed(2)}
        min={0.02}
        max={0.2}
        step={0.01}
        onChange={(value) => setAppearance('vertexSize', value)}
      />
      <ColorControl
        label={strings.appearance.labelColor}
        value={appearance.labelColor}
        onChange={(value) => setAppearance('labelColor', value)}
      />
      <RangeControl
        label={strings.appearance.labelSize}
        value={appearance.labelSize}
        displayValue={`${Math.round(appearance.labelSize * 100)}%`}
        min={0.5}
        max={2}
        step={0.1}
        onChange={(value) => setAppearance('labelSize', value)}
      />
    </div>
  )
}
