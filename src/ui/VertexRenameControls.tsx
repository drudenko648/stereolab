import { useState } from 'react'
import type { Solid } from '../geometry/types'
import { type VertexNameError } from '../geometry/rename'
import { joinLabel, splitLabel } from '../geometry/naming'
import { generateSolid } from '../geometry/shapes'
import { useSolid } from '../state/useSolid'
import { useStore } from '../state/useStore'
import { NameFields } from './NameFields'
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
  const initial = splitLabel(selectedName)
  const [base, setBase] = useState(initial.base)
  const [sub, setSub] = useState(initial.sub)
  const [error, setError] = useState<VertexNameError | null>(null)

  if (!selected) return null

  const loadFromName = (name: string) => {
    const parts = splitLabel(name)
    setBase(parts.base)
    setSub(parts.sub)
    setError(null)
  }

  const apply = () => {
    const result = renameVertex(selected.id, joinLabel(base, sub))
    if (result.ok) {
      loadFromName(result.value)
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
    loadFromName(autoName)
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
            loadFromName(vertex?.name ?? '')
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
      <NameFields
        base={base}
        sub={sub}
        onBase={(value) => {
          setBase(value)
          setError(null)
        }}
        onSub={(value) => {
          setSub(value)
          setError(null)
        }}
        onSubmit={apply}
      />
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
