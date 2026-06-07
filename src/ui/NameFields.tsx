import { MAX_VERTEX_NAME_LENGTH } from '../geometry/rename'
import { strings } from './strings'

/**
 * The base-label + subscript input pair used by both the panel rename editor
 * and the in-canvas floating editor. The subscript field is restricted to
 * digits and combined with the base via joinLabel by the caller.
 */
export function NameFields({
  base,
  sub,
  onBase,
  onSub,
  onSubmit,
  autoFocus,
}: {
  base: string
  sub: string
  onBase: (value: string) => void
  onSub: (value: string) => void
  onSubmit?: () => void
  autoFocus?: boolean
}) {
  const submitOnEnter = (key: string) => {
    if (key === 'Enter' && onSubmit) onSubmit()
  }
  return (
    <div className="flex items-end gap-2">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span>{strings.rename.name}</span>
        <input
          aria-label={strings.rename.name}
          value={base}
          maxLength={MAX_VERTEX_NAME_LENGTH}
          autoFocus={autoFocus}
          onChange={(event) => onBase(event.target.value)}
          onKeyDown={(event) => submitOnEnter(event.key)}
          className="w-full rounded border border-slate-300 px-2 py-1.5"
        />
      </label>
      <label className="flex w-14 flex-col gap-1 text-sm">
        <span>{strings.rename.subscript}</span>
        <input
          aria-label={strings.rename.subscript}
          value={sub}
          inputMode="numeric"
          maxLength={3}
          onChange={(event) =>
            onSub(event.target.value.replace(/[^0-9]/g, ''))
          }
          onKeyDown={(event) => submitOnEnter(event.key)}
          className="w-full rounded border border-slate-300 px-2 py-1.5"
        />
      </label>
    </div>
  )
}
