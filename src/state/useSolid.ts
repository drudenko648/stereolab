import { useMemo } from 'react'
import { useStore } from './useStore'
import { generateSolid } from '../geometry/shapes'

/** Derive the current Solid from the store, memoised on {type, params}. */
export function useSolid() {
  const type = useStore((s) => s.shapeType)
  const params = useStore((s) => s.paramsByShape[s.shapeType])
  return useMemo(() => generateSolid(type, params), [type, params])
}
