// Auto-naming for solid vertices following the Russian school convention:
// base vertices A, B, C, D …; the corresponding top vertices A₁, B₁, C₁ …;
// special apex points such as S for a pyramid.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const SUBSCRIPT_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

/** Shared apex label for pyramids and cones. */
export const APEX_PYRAMID = 'S'
export const CENTER = 'O'
export const TOP_CENTER = `O${subscript(1)}`

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

const SUBSCRIPT_TO_DIGIT = new Map(
  SUBSCRIPT_DIGITS.map((glyph, i) => [glyph, String(i)]),
)

/**
 * Split a name into its base text and its subscript digits (as ordinary
 * digits). Labels are rendered by drawing the base and a smaller, lowered
 * subscript separately, so we never depend on the font having ₀–₉ glyphs.
 */
export function splitLabel(name: string): { base: string; sub: string } {
  let base = ''
  let sub = ''
  for (const ch of name) {
    const digit = SUBSCRIPT_TO_DIGIT.get(ch)
    if (digit !== undefined) sub += digit
    else base += ch
  }
  return { base, sub }
}

/** Convert a string of ordinary digits to subscript glyphs, dropping non-digits. */
export function toSubscript(digits: string): string {
  let out = ''
  for (const ch of digits) {
    const value = Number(ch)
    if (ch >= '0' && ch <= '9') out += SUBSCRIPT_DIGITS[value]
  }
  return out
}

/** Combine a base label with subscript digits into a full name, e.g. ("A","1") → "A₁". */
export function joinLabel(base: string, subDigits: string): string {
  return base + toSubscript(subDigits)
}
