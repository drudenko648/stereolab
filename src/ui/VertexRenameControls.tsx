import { useState } from 'react'
import type { Solid } from '../geometry/types'
import {
  MAX_VERTEX_NAME_LENGTH,
  type VertexNameError,
} from '../geometry/rename'
import { generateSolid } from '../geometry/shapes'
import { useSolid } from '../state/useSolid'
import { useStore } from '../state/useStore'
import { strings } from './strings'

/** Edit one displayed point name and reset the current solid to auto-naming. */
export function VertexRenameControls() {
  const shapeType = useStore((state) => state.shapeType)
  const params = useStore((state) => state.paramsByShape[state.shapeType])
  const solid = useSolid()
  const autoSolid = generateSolid(shapeType, params)

  return (
    <VertexRenameEditor
      key={`${shapeType}-${solid.vertices.length}`}
      solid={solid}
      autoSolid={autoSolid}
    />
  )
}

function VertexRenameEditor({
  solid,
  autoSolid,
}: {
  solid: Solid
  autoSolid: Solid
}) {
  const renameVertex = useStore((state) => state.renameVertex)
  const resetVertexNames = useStore((state) => state.resetVertexNames)
  const [selectedId, setSelectedId] = useState(0)
  const selected =
    solid.vertices.find((vertex) => vertex.id === selectedId) ??
    solid.vertices[0]
  const selectedName = selected?.name ?? ''
  const [draft, setDraft] = useState(selectedName)
  const [error, setError] = useState<VertexNameError | null>(null)

  if (!selected) return null

  const apply = () => {
    const result = renameVertex(selected.id, draft)
    if (result.ok) {
      setDraft(result.value)
      setError(null)
    } else {
      setError(result.reason)
    }
  }

  const reset = () => {
    resetVertexNames()
    const autoName =
      autoSolid.vertices.find((vertex) => vertex.id === selected.id)?.name ??
      autoSolid.vertices[0]?.name ??
      ''
    setDraft(autoName)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>{strings.rename.vertex}</span>
        <select
          aria-label={strings.rename.vertex}
          value={selected.id}
          onChange={(event) => {
            const id = Number(event.target.value)
            const vertex = solid.vertices.find((item) => item.id === id)
            setSelectedId(id)
            setDraft(vertex?.name ?? '')
            setError(null)
          }}
          className="min-w-20 rounded border border-slate-300 bg-white px-2 py-1"
        >
          {solid.vertices.map((vertex) => (
            <option key={vertex.id} value={vertex.id}>
              {vertex.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{strings.rename.name}</span>
        <input
          aria-label={strings.rename.name}
          value={draft}
          maxLength={MAX_VERTEX_NAME_LENGTH}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') apply()
          }}
          className="rounded border border-slate-300 px-2 py-1.5"
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {strings.rename.errors[error]}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded bg-slate-800 px-2 py-1.5 text-sm text-white hover:bg-slate-700"
        >
          {strings.rename.apply}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm hover:bg-slate-50"
        >
          {strings.rename.reset}
        </button>
      </div>
    </div>
  )
}
