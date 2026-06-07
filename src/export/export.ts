// Pure helpers for PNG export. The impure capture (toDataURL, download) lives
// in the ExportController component; everything decidable without WebGL is here
// so it can be unit-tested.

export type ExportBackground = 'transparent' | 'white' | 'dark'
export type ExportScale = 1 | 2 | 4

export const EXPORT_BACKGROUNDS: readonly ExportBackground[] = [
  'transparent',
  'white',
  'dark',
]
export const EXPORT_SCALES: readonly ExportScale[] = [1, 2, 4]

export interface BackgroundSettings {
  /** Scene/clear colour as a hex string, or null for a transparent canvas. */
  readonly color: string | null
  /** Clear-colour alpha: 0 for transparent, 1 for an opaque background. */
  readonly alpha: number
}

export function backgroundSettings(bg: ExportBackground): BackgroundSettings {
  switch (bg) {
    case 'transparent':
      return { color: null, alpha: 0 }
    case 'white':
      return { color: '#ffffff', alpha: 1 }
    case 'dark':
      return { color: '#15171c', alpha: 1 }
  }
}

export interface Size {
  readonly width: number
  readonly height: number
}

/** Scale a render size for high-resolution export, rounded to whole pixels. */
export function scaledSize(size: Size, scale: number): Size {
  return {
    width: Math.round(size.width * scale),
    height: Math.round(size.height * scale),
  }
}

/** Deterministic download filename for a shape, e.g. "stereolab-cube.png". */
export function exportFilename(type: string, ext = 'png'): string {
  return `stereolab-${type}.${ext}`
}
