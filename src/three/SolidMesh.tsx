import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Solid } from '../geometry/types'
import { useStore } from '../state/useStore'

/** Renders the filled faces of a solid as a single flat-shaded mesh. */
export function SolidMesh({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.figureColor)
  const opacity = useStore((s) => s.appearance.faceOpacity)

  const geometry = useMemo(() => buildFaceGeometry(solid), [solid])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        flatShading
        metalness={0}
        roughness={0.85}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
    </mesh>
  )
}

/** Fan-triangulate each (convex) face into a non-indexed buffer geometry. */
function buildFaceGeometry(solid: Solid): THREE.BufferGeometry {
  const positions: number[] = []
  const push = (id: number) => {
    const p = solid.vertices[id].position
    positions.push(p[0], p[1], p[2])
  }
  for (const face of solid.faces) {
    const vs = face.vertices
    for (let i = 1; i < vs.length - 1; i++) {
      push(vs[0])
      push(vs[i])
      push(vs[i + 1])
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.computeVertexNormals()
  return geometry
}
