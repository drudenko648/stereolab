import { Html } from '@react-three/drei'
import { useState } from 'react'
import { joinLabel, splitLabel } from '../geometry/naming'
import type { VertexNameError, VertexNameValidation } from '../geometry/rename'
import type { Solid, Vec3 } from '../geometry/types'
import { useStore } from '../state/useStore'
import { NameFields } from '../ui/NameFields'
import { strings } from '../ui/strings'

/**
 * In-canvas floating editor for renaming a solid vertex or a section corner.
 * Opened via double-click (see RenameTargets / SectionLayer); renders a small
 * DOM card with the base + subscript inputs. It's a drei <Html> overlay used
 * only while editing, so it never appears in the exported WebGL PNG.
 */
export function LabelEditorOverlay({ solid }: { solid: Solid }) {
  const editing = useStore((s) => s.editing)
  const renameVertex = useStore((s) => s.renameVertex)
  const setSectionVertexName = useStore((s) => s.setSectionVertexName)
  const stopEditing = useStore((s) => s.stopEditing)
  const polygon = useStore((s) => s.section.polygon)
  const vertexNames = useStore((s) => s.section.vertexNames)

  if (!editing) return null

  let position: Vec3
  let name: string
  let apply: (full: string) => VertexNameValidation

  if (editing.kind === 'vertex') {
    const vertex = solid.vertices.find((v) => v.id === editing.id)
    if (!vertex) return null
    position = vertex.position
    name = vertex.name
    apply = (full) => renameVertex(editing.id, full)
  } else {
    if (editing.index >= polygon.length) return null
    position = polygon[editing.index]
    name = vertexNames[editing.index] ?? `P${editing.index + 1}`
    apply = (full) => setSectionVertexName(editing.index, full)
  }

  return (
    <EditorCard
      key={`${editing.kind}-${editing.kind === 'vertex' ? editing.id : editing.index}`}
      position={position}
      name={name}
      apply={apply}
      onClose={stopEditing}
    />
  )
}

function EditorCard({
  position,
  name,
  apply,
  onClose,
}: {
  position: Vec3
  name: string
  apply: (full: string) => VertexNameValidation
  onClose: () => void
}) {
  const initial = splitLabel(name)
  const [base, setBase] = useState(initial.base)
  const [sub, setSub] = useState(initial.sub)
  const [error, setError] = useState<VertexNameError | null>(null)

  const submit = () => {
    const result = apply(joinLabel(base, sub))
    if (result.ok) onClose()
    else setError(result.reason)
  }

  return (
    <Html position={[position[0], position[1], position[2]]} center>
      <div
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
        }}
        className="w-56 rounded-lg border border-slate-300 bg-white p-2 shadow-lg"
      >
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
          onSubmit={submit}
          autoFocus
        />
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-700">
            {strings.rename.errors[error]}
          </p>
        )}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={submit}
            className="rounded bg-slate-800 px-2 py-1 text-sm text-white hover:bg-slate-700"
          >
            {strings.rename.apply}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
          >
            {strings.rename.cancel}
          </button>
        </div>
      </div>
    </Html>
  )
}
