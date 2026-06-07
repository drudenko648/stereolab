import { useMemo } from 'react'
import { useStore } from './useStore'
import { generateSolid } from '../geometry/shapes'
import { applyVertexNames } from '../geometry/rename'

/** Derive the current Solid from the store, memoised on {type, params}. */
export function useSolid() {
  const type = useStore((s) => s.shapeType)
  const params = useStore((s) => s.paramsByShape[s.shapeType])
  const names = useStore((s) => s.vertexNamesByShape[s.shapeType])
  return useMemo(
    () => applyVertexNames(generateSolid(type, params), names),
    [type, params, names],
  )
}
