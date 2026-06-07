// Auto-naming for solid vertices following the Russian school convention:
// base vertices A, B, C, D …; the corresponding top vertices A₁, B₁, C₁ …;
// special apex points such as S for a pyramid.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const SUBSCRIPT_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

/** Apex label for a pyramid (cone uses the same in later stages). */
export const APEX_PYRAMID = 'S'

/** Render an integer as Unicode subscript digits, e.g. 1 → "₁", 12 → "₁₂". */
export function subscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUBSCRIPT_DIGITS[Number(d)])
    .join('')
}

/** Base letter for a vertex index: 0 → A, 1 → B … 25 → Z, 26 → AA … */
export function letterName(index: number): string {
  if (index < LETTERS.length) return LETTERS[index]
  const first = LETTERS[Math.floor(index / LETTERS.length) - 1]
  const second = LETTERS[index % LETTERS.length]
  return first + second
}

/** Names for a base ring of n vertices: ["A", "B", "C", …]. */
export function baseRingNames(n: number): string[] {
  return Array.from({ length: n }, (_, i) => letterName(i))
}

/** Names for a top ring of n vertices at level k (default 1): ["A₁", "B₁", …]. */
export function topRingNames(n: number, level = 1): string[] {
  const suffix = subscript(level)
  return Array.from({ length: n }, (_, i) => letterName(i) + suffix)
}
