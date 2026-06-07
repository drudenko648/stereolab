import {
  EXPORT_BACKGROUNDS,
  EXPORT_SCALES,
  type ExportBackground,
  type ExportScale,
} from '../export/export'
import { useStore } from '../state/useStore'
import { strings } from './strings'

const SELECT =
  'w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm'

/** Background + resolution selectors and the PNG download trigger. */
export function ExportControls() {
  const settings = useStore((s) => s.exportSettings)
  const setBackground = useStore((s) => s.setExportBackground)
  const setScale = useStore((s) => s.setExportScale)
  const requestExport = useStore((s) => s.requestExport)

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span>{strings.export.background}</span>
        <select
          aria-label={strings.export.background}
          value={settings.background}
          onChange={(e) => setBackground(e.target.value as ExportBackground)}
          className={SELECT}
        >
          {EXPORT_BACKGROUNDS.map((bg) => (
            <option key={bg} value={bg}>
              {strings.export[bg]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{strings.export.resolution}</span>
        <select
          aria-label={strings.export.resolution}
          value={settings.scale}
          onChange={(e) =>
            setScale(Number(e.target.value) as ExportScale)
          }
          className={SELECT}
        >
          {EXPORT_SCALES.map((scale) => (
            <option key={scale} value={scale}>
              {scale}×
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={requestExport}
        className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        {strings.export.download}
      </button>
    </div>
  )
}
