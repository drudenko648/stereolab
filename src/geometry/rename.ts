import type { Solid } from './types'

export const MAX_VERTEX_NAME_LENGTH = 12

export type VertexNameError = 'empty' | 'tooLong' | 'duplicate'

export type VertexNameValidation =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly reason: VertexNameError }

/** Validate and normalize a manual vertex name. */
export function validateVertexName(
  name: string,
  existingNames: readonly string[],
): VertexNameValidation {
  const value = name.trim()
  if (value === '') return { ok: false, reason: 'empty' }
  if (Array.from(value).length > MAX_VERTEX_NAME_LENGTH) {
    return { ok: false, reason: 'tooLong' }
  }
  if (existingNames.includes(value)) {
    return { ok: false, reason: 'duplicate' }
  }
  return { ok: true, value }
}

/** Return a solid with name overrides applied by stable vertex id. */
export function applyVertexNames(
  solid: Solid,
  names: Readonly<Record<number, string>>,
): Solid {
  return {
    ...solid,
    vertices: solid.vertices.map((vertex) => ({
      ...vertex,
      name: names[vertex.id] ?? vertex.name,
    })),
  }
}
