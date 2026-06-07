import type { Edge, Face, Solid, Vec3 } from '../types'

export interface SectionMesh {
  readonly vertices: readonly Vec3[]
  readonly edges: readonly Edge[]
  readonly faces: readonly Face[]
  readonly approximate: boolean
}

/**
 * Convert a solid to the convex boundary mesh used by section maths and
 * interaction. Polyhedra keep their exact topology; revolved surfaces use the
 * same radial segment count as their rendered Three.js geometry.
 */
export function sectionMeshForSolid(solid: Solid): SectionMesh | null {
  if (!solid.surface) {
    return {
      vertices: solid.vertices.map((vertex) => vertex.position),
      edges: solid.edges,
      faces: solid.faces,
      approximate: false,
    }
  }

  if (solid.surface.kind === 'sphere') return null

  return revolvedMesh(
    solid.surface.bottomRadius,
    solid.surface.topRadius,
    solid.surface.height,
    solid.surface.radialSegments,
  )
}

function revolvedMesh(
  bottomRadius: number,
  topRadius: number,
  height: number,
  segments: number,
): SectionMesh {
  const n = Math.max(8, Math.round(segments))
  const halfHeight = height / 2
  const bottom = ring(bottomRadius, -halfHeight, n)
  const hasTopRing = topRadius > 1e-9
  const top = hasTopRing
    ? ring(topRadius, halfHeight, n)
    : ([[0, halfHeight, 0]] satisfies Vec3[])
  const vertices = [...bottom, ...top]
  const edges: Edge[] = []
  const faces: Face[] = [
    { vertices: Array.from({ length: n }, (_, index) => n - index - 1) },
  ]

  for (let index = 0; index < n; index++) {
    const next = (index + 1) % n
    edges.push({ a: index, b: next })
  }

  if (hasTopRing) {
    const topOffset = n
    faces.push({
      vertices: Array.from({ length: n }, (_, index) => topOffset + index),
    })
    for (let index = 0; index < n; index++) {
      const next = (index + 1) % n
      edges.push({ a: topOffset + index, b: topOffset + next })
      edges.push({ a: index, b: topOffset + index })
      faces.push({
        vertices: [index, next, topOffset + next, topOffset + index],
      })
    }
  } else {
    const apex = n
    for (let index = 0; index < n; index++) {
      const next = (index + 1) % n
      edges.push({ a: index, b: apex })
      faces.push({ vertices: [index, next, apex] })
    }
  }

  return { vertices, edges, faces, approximate: true }
}

function ring(radius: number, y: number, segments: number): Vec3[] {
  return Array.from({ length: segments }, (_, index) => {
    const angle = Math.PI / 2 + (index * 2 * Math.PI) / segments
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)]
  })
}
