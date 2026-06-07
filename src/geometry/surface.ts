import type { Surface, Vec3 } from './types'

/** Characteristic circles and generators shown as edges for curved solids. */
export function characteristicLines(surface: Surface): Vec3[][] {
  if (surface.kind === 'sphere') {
    return [
      circle(surface.radius, surface.widthSegments, 'xz'),
      circle(surface.radius, surface.widthSegments, 'xy'),
      circle(surface.radius, surface.widthSegments, 'yz'),
    ]
  }

  const lines: Vec3[][] = []
  const halfHeight = surface.height / 2
  lines.push(
    horizontalCircle(
      surface.bottomRadius,
      -halfHeight,
      surface.radialSegments,
    ),
  )
  if (surface.topRadius > 0) {
    lines.push(
      horizontalCircle(
        surface.topRadius,
        halfHeight,
        surface.radialSegments,
      ),
    )
  }

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2
    lines.push([
      [
        surface.bottomRadius * Math.cos(angle),
        -halfHeight,
        surface.bottomRadius * Math.sin(angle),
      ],
      [
        surface.topRadius * Math.cos(angle),
        halfHeight,
        surface.topRadius * Math.sin(angle),
      ],
    ])
  }
  return lines
}

function horizontalCircle(
  radius: number,
  y: number,
  segments: number,
): Vec3[] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = i === segments ? 0 : (i * 2 * Math.PI) / segments
    return [radius * Math.cos(angle), y, radius * Math.sin(angle)]
  })
}

function circle(
  radius: number,
  segments: number,
  plane: 'xy' | 'xz' | 'yz',
): Vec3[] {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = i === segments ? 0 : (i * 2 * Math.PI) / segments
    const a = radius * Math.cos(angle)
    const b = radius * Math.sin(angle)
    if (plane === 'xy') return [a, b, 0]
    if (plane === 'yz') return [0, a, b]
    return [a, 0, b]
  })
}
