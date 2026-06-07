import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Solid } from '../geometry/types'
import { useStore } from '../state/useStore'
import { v3 } from './util'

/** Renders a small sphere at each vertex. */
export function VertexPoints({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.vertexColor)
  const size = useStore((s) => s.appearance.vertexSize)

  // One shared sphere geometry for every vertex; rebuilt only when size changes.
  const geometry = useMemo(
    () => new THREE.SphereGeometry(size, 16, 16),
    [size],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      {solid.vertices.map((vertex) => (
        <mesh key={vertex.id} geometry={geometry} position={v3(vertex.position)}>
          <meshStandardMaterial color={color} metalness={0} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
