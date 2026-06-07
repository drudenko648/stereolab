import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Solid } from '../geometry/types'
import { useStore } from '../state/useStore'
import { v3 } from './util'

/** Renders a small sphere at each vertex. */
export function VertexPoints({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.vertexColor)
  const size = useStore((s) => s.appearance.vertexSize)
  const showThrough = solid.surface !== undefined

  // One shared sphere geometry for every vertex; rebuilt only when size changes.
  const geometry = useMemo(
    () => new THREE.SphereGeometry(size, 16, 16),
    [size],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  // Keyed by solid.type so switching shape remounts the vertex meshes rather
  // than reusing the previous shape's instances (which left A/B unrendered
  // after switching away from the cylinder).
  return (
    <group key={solid.type}>
      {solid.vertices.map((vertex) => (
        <mesh
          key={vertex.id}
          geometry={geometry}
          position={v3(vertex.position)}
          renderOrder={showThrough ? 9 : 0}
        >
          <meshStandardMaterial
            color={color}
            metalness={0}
            roughness={0.6}
            depthTest={!showThrough}
            depthWrite={!showThrough}
            transparent={showThrough}
          />
        </mesh>
      ))}
    </group>
  )
}
