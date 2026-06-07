import type { ViewPreset } from '../state/useStore'
import { useStore } from '../state/useStore'
import { strings } from './strings'

const PRESETS: readonly ViewPreset[] = ['front', 'side', 'top', 'iso']

const BTN =
  'rounded border border-slate-300 bg-white px-2 py-1.5 text-sm hover:bg-slate-50 active:bg-slate-100'

/** Quick-view buttons, reset, and the export lock toggle. */
export function CameraControls() {
  const setView = useStore((s) => s.setView)
  const resetView = useStore((s) => s.resetView)
  const toggleLock = useStore((s) => s.toggleLock)
  const locked = useStore((s) => s.cameraLocked)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={BTN}
            onClick={() => setView(preset)}
          >
            {strings.camera[preset]}
          </button>
        ))}
      </div>
      <button type="button" className={BTN} onClick={resetView}>
        {strings.camera.reset}
      </button>
      <button
        type="button"
        aria-pressed={locked}
        onClick={toggleLock}
        className={
          locked
            ? 'rounded border border-amber-400 bg-amber-50 px-2 py-1.5 text-sm text-amber-800'
            : BTN
        }
      >
        {locked ? strings.camera.unlock : strings.camera.lock}
      </button>
    </div>
  )
}
