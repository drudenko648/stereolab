import {
  add,
  clamp,
  cross,
  dot,
  length,
  lerp,
  normalize,
  scale,
  sub,
} from '../math'
import type { Vec3 } from '../types'
import type { SectionMesh } from './mesh'

export interface EdgeSectionHost {
  readonly kind: 'edge'
  readonly edgeIndex: number
  readonly t: number
}

export interface VertexSectionHost {
  readonly kind: 'vertex'
  readonly vertexIndex: number
}

export interface FaceSectionHost {
  readonly kind: 'face'
  readonly faceIndex: number
  readonly u: number
  readonly v: number
}

export type SectionHost =
  | EdgeSectionHost
  | VertexSectionHost
  | FaceSectionHost

interface FaceBasis {
  readonly origin: Vec3
  readonly axisU: Vec3
  readonly axisV: Vec3
  readonly normal: Vec3
  readonly polygon: readonly Vec2[]
}

type Vec2 = readonly [number, number]

export function edgeHostFromPoint(
  mesh: SectionMesh,
  edgeIndex: number,
  point: Vec3,
): EdgeSectionHost {
  const edge = mesh.edges[edgeIndex]
  const a = mesh.vertices[edge.a]
  const b = mesh.vertices[edge.b]
  const direction = sub(b, a)
  const denominator = dot(direction, direction)
  const t =
    denominator === 0 ? 0 : dot(sub(point, a), direction) / denominator
  return { kind: 'edge', edgeIndex, t: clamp(t, 0, 1) }
}

export function faceHostFromPoint(
  mesh: SectionMesh,
  faceIndex: number,
  point: Vec3,
): FaceSectionHost {
  const basis = faceBasis(mesh, faceIndex)
  const relative = sub(point, basis.origin)
  const projected: Vec2 = [
    dot(relative, basis.axisU),
    dot(relative, basis.axisV),
  ]
  const [u, v] = constrainToPolygon(projected, basis.polygon)
  return { kind: 'face', faceIndex, u, v }
}

export function resolveHostPoint(
  mesh: SectionMesh,
  host: SectionHost,
): Vec3 {
  if (host.kind === 'vertex') {
    return mesh.vertices[host.vertexIndex]
  }

  if (host.kind === 'edge') {
    const edge = mesh.edges[host.edgeIndex]
    return lerp(
      mesh.vertices[edge.a],
      mesh.vertices[edge.b],
      clamp(host.t, 0, 1),
    )
  }

  const basis = faceBasis(mesh, host.faceIndex)
  const [u, v] = constrainToPolygon([host.u, host.v], basis.polygon)
  return add(
    basis.origin,
    add(scale(basis.axisU, u), scale(basis.axisV, v)),
  )
}

export function moveHostFromRay(
  mesh: SectionMesh,
  host: SectionHost,
  rayOrigin: Vec3,
  rayDirection: Vec3,
): SectionHost {
  if (host.kind === 'vertex') return host

  if (host.kind === 'edge') {
    const edge = mesh.edges[host.edgeIndex]
    return {
      ...host,
      t: closestSegmentParameterToRay(
        mesh.vertices[edge.a],
        mesh.vertices[edge.b],
        rayOrigin,
        rayDirection,
      ),
    }
  }

  const basis = faceBasis(mesh, host.faceIndex)
  const denominator = dot(basis.normal, rayDirection)
  if (Math.abs(denominator) < 1e-9) return host
  const rayT =
    dot(basis.normal, sub(basis.origin, rayOrigin)) / denominator
  if (rayT < 0) return host
  const point = add(rayOrigin, scale(rayDirection, rayT))
  return faceHostFromPoint(mesh, host.faceIndex, point)
}

export function closestSegmentParameterToRay(
  segmentStart: Vec3,
  segmentEnd: Vec3,
  rayOrigin: Vec3,
  rayDirection: Vec3,
): number {
  const segment = sub(segmentEnd, segmentStart)
  const ray = normalize(rayDirection)
  const offset = sub(segmentStart, rayOrigin)
  const a = dot(segment, segment)
  if (a <= 1e-12) return 0
  const b = dot(segment, ray)
  const c = dot(ray, ray)
  const d = dot(segment, offset)
  const e = dot(ray, offset)
  const denominator = a * c - b * b

  let segmentT =
    Math.abs(denominator) <= 1e-12
      ? -d / a
      : (b * e - c * d) / denominator
  const rayT =
    Math.abs(denominator) <= 1e-12
      ? 0
      : (a * e - b * d) / denominator
  if (rayT < 0) segmentT = -d / a
  return clamp(segmentT, 0, 1)
}

function faceBasis(mesh: SectionMesh, faceIndex: number): FaceBasis {
  const face = mesh.faces[faceIndex]
  const origin = mesh.vertices[face.vertices[0]]
  const firstDirection = sub(mesh.vertices[face.vertices[1]], origin)
  const axisU = normalize(firstDirection)
  let normal: Vec3 = [0, 0, 0]

  for (let index = 2; index < face.vertices.length; index++) {
    normal = normalize(
      cross(axisU, sub(mesh.vertices[face.vertices[index]], origin)),
    )
    if (length(normal) > 1e-9) break
  }
  if (length(normal) <= 1e-9) {
    throw new Error(`Face ${faceIndex} is degenerate`)
  }

  const axisV = cross(normal, axisU)
  const polygon = face.vertices.map<Vec2>((vertexIndex) => {
    const relative = sub(mesh.vertices[vertexIndex], origin)
    return [dot(relative, axisU), dot(relative, axisV)]
  })
  return { origin, axisU, axisV, normal, polygon }
}

function constrainToPolygon(point: Vec2, polygon: readonly Vec2[]): Vec2 {
  if (insideConvexPolygon(point, polygon)) return point

  let closest = polygon[0]
  let closestDistanceSquared = Infinity
  for (let index = 0; index < polygon.length; index++) {
    const candidate = closestPointOnSegment2d(
      point,
      polygon[index],
      polygon[(index + 1) % polygon.length],
    )
    const deltaX = candidate[0] - point[0]
    const deltaY = candidate[1] - point[1]
    const distanceSquared = deltaX * deltaX + deltaY * deltaY
    if (distanceSquared < closestDistanceSquared) {
      closest = candidate
      closestDistanceSquared = distanceSquared
    }
  }
  return closest
}

function insideConvexPolygon(point: Vec2, polygon: readonly Vec2[]): boolean {
  let sign = 0
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index]
    const b = polygon[(index + 1) % polygon.length]
    const crossZ =
      (b[0] - a[0]) * (point[1] - a[1]) -
      (b[1] - a[1]) * (point[0] - a[0])
    if (Math.abs(crossZ) <= 1e-9) continue
    const currentSign = Math.sign(crossZ)
    if (sign === 0) sign = currentSign
    else if (currentSign !== sign) return false
  }
  return true
}

function closestPointOnSegment2d(
  point: Vec2,
  start: Vec2,
  end: Vec2,
): Vec2 {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const denominator = dx * dx + dy * dy
  if (denominator === 0) return start
  const t = clamp(
    ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
      denominator,
    0,
    1,
  )
  return [start[0] + dx * t, start[1] + dy * t]
}
