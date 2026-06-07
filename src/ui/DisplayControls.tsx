import type { DisplayKey } from '../state/useStore'
import { useStore } from '../state/useStore'
import { strings } from './strings'

const KEYS: readonly DisplayKey[] = ['faces', 'edges', 'vertices', 'labels']

/** Checkboxes toggling faces / edges / vertices / labels independently. */
export function DisplayControls() {
  const display = useStore((s) => s.display)
  const toggle = useStore((s) => s.toggleDisplay)

  return (
    <div className="flex flex-col gap-2">
      {KEYS.map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={display[key]}
            onChange={() => toggle(key)}
          />
          {strings.display[key]}
        </label>
      ))}
    </div>
  )
}
