import { describe, expect, it } from 'vitest'
import {
  applyVertexNames,
  MAX_VERTEX_NAME_LENGTH,
  validateVertexName,
} from '../../src/geometry/rename'
import { cube } from '../../src/geometry/shapes/cube'

describe('vertex renaming', () => {
  it('trims and accepts a unique, non-empty name', () => {
    expect(validateVertexName('  P  ', ['A', 'B'])).toEqual({
      ok: true,
      value: 'P',
    })
  })

  it('rejects empty, long and duplicate names', () => {
    expect(validateVertexName('   ', [])).toEqual({
      ok: false,
      reason: 'empty',
    })
    expect(validateVertexName('X'.repeat(MAX_VERTEX_NAME_LENGTH + 1), [])).toEqual({
      ok: false,
      reason: 'tooLong',
    })
    expect(validateVertexName('A', ['A', 'B'])).toEqual({
      ok: false,
      reason: 'duplicate',
    })
  })

  it('applies overrides without mutating the generated solid', () => {
    const original = cube({ size: 2 })
    const renamed = applyVertexNames(original, { 0: 'P', 5: 'Q' })
    expect(renamed.vertices[0].name).toBe('P')
    expect(renamed.vertices[5].name).toBe('Q')
    expect(original.vertices[0].name).toBe('A')
    expect(renamed.vertices[1]).toEqual(original.vertices[1])
  })
})
