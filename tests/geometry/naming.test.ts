import { describe, expect, it } from 'vitest'
import {
  baseRingNames,
  joinLabel,
  letterName,
  splitLabel,
  subscript,
  toSubscript,
  topRingNames,
} from '../../src/geometry/naming'

describe('naming', () => {
  it('renders subscripts', () => {
    expect(subscript(1)).toBe('₁')
    expect(subscript(2)).toBe('₂')
    expect(subscript(12)).toBe('₁₂')
  })

  it('maps indices to letters', () => {
    expect(letterName(0)).toBe('A')
    expect(letterName(3)).toBe('D')
    expect(letterName(25)).toBe('Z')
    expect(letterName(26)).toBe('AA')
  })

  it('builds base rings', () => {
    expect(baseRingNames(4)).toEqual(['A', 'B', 'C', 'D'])
    expect(baseRingNames(3)).toEqual(['A', 'B', 'C'])
  })

  it('builds top rings with subscripts', () => {
    expect(topRingNames(4)).toEqual(['A₁', 'B₁', 'C₁', 'D₁'])
    expect(topRingNames(3, 2)).toEqual(['A₂', 'B₂', 'C₂'])
  })

  it('splits a name into base and ordinary-digit subscript', () => {
    expect(splitLabel('A')).toEqual({ base: 'A', sub: '' })
    expect(splitLabel('S')).toEqual({ base: 'S', sub: '' })
    expect(splitLabel('A₁')).toEqual({ base: 'A', sub: '1' })
    expect(splitLabel('D₁')).toEqual({ base: 'D', sub: '1' })
    expect(splitLabel('A₁₂')).toEqual({ base: 'A', sub: '12' })
  })

  it('converts ordinary digits to subscript glyphs, dropping non-digits', () => {
    expect(toSubscript('1')).toBe('₁')
    expect(toSubscript('12')).toBe('₁₂')
    expect(toSubscript('')).toBe('')
    expect(toSubscript('a1b2')).toBe('₁₂')
  })

  it('joins base + subscript and round-trips with splitLabel', () => {
    expect(joinLabel('A', '1')).toBe('A₁')
    expect(joinLabel('O', '')).toBe('O')
    expect(joinLabel('A', '12')).toBe('A₁₂')
    for (const name of ['A', 'A₁', 'B₁₂', 'S', 'O₁']) {
      const { base, sub } = splitLabel(name)
      expect(joinLabel(base, sub)).toBe(name)
    }
  })
})
