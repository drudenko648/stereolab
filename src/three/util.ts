import type { Vec3 } from '../geometry/types'

/** Convert a readonly Vec3 to a mutable tuple accepted by R3F/three props. */
export function v3(p: Vec3): [number, number, number] {
  return [p[0], p[1], p[2]]
}
