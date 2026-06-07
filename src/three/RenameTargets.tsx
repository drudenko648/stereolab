import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Solid } from '../geometry/types'
import { useStore } from '../state/useStore'
import { v3 } from './util'

/**
 * Invisible hit-spheres over each solid vertex that open the floating rename
 * editor on double-click. Rendered only when section mode is off (see Scene),
 * so it never competes with section point placement. The material has
 * colorWrite/depthWrite off so it draws nothing at all (no perturbation of the
 * transparent vertex spheres), yet raycasting still tests the geometry, so
 * occluded vertices stay double-clickable.
 */
export function RenameTargets({ solid }: { solid: Solid }) {
  const startEditing = useStore((s) => s.startEditing)
  const geometry = useMemo(() => new THREE.SphereGeometry(0.14, 12, 12), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group key={solid.type}>
      {solid.vertices.map((vertex) => (
        <mesh
          key={vertex.id}
          geometry={geometry}
          position={v3(vertex.position)}
          onDoubleClick={(event) => {
            event.stopPropagation()
            startEditing({ kind: 'vertex', id: vertex.id })
          }}
        >
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
