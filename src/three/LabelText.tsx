import { Text } from '@react-three/drei'
import type { ReactNode } from 'react'
import { splitLabel } from '../geometry/naming'

// Proportions taken from the original hard-coded vertex-label sizes (base 0.3):
// the subscript glyph, the outline and the subscript offset all scale with the
// caller-provided base font size so labels stay self-consistent at any size.
const SUB_RATIO = 0.19 / 0.3
const OUTLINE_RATIO = 0.018 / 0.3
const SUB_DX = 0.03 / 0.3
const SUB_DY = -0.08 / 0.3

/** Force a label to draw over solid surfaces (used for curved solids/sections). */
function showThroughSurfaces(text: {
  renderOrder: number
  material: {
    depthTest: boolean
    depthWrite: boolean
    opacity: number
    transparent: boolean
  }
}): void {
  text.renderOrder = 10
  text.material.depthTest = false
  text.material.depthWrite = false
  text.material.opacity = 1
  text.material.transparent = true
}

function Glyph({
  children,
  color,
  fontSize,
  outlineWidth,
  anchorX,
  position,
  showThrough,
}: {
  children: ReactNode
  color: string
  fontSize: number
  outlineWidth: number
  anchorX: 'left' | 'right' | 'center'
  position?: [number, number, number]
  showThrough: boolean
}) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX={anchorX}
      anchorY="middle"
      outlineWidth={outlineWidth}
      outlineColor="#ffffff"
      depthOffset={showThrough ? -10 : 0}
      onSync={showThrough ? showThroughSurfaces : undefined}
      renderOrder={showThrough ? 10 : 0}
    >
      {children}
      {showThrough && (
        <meshBasicMaterial
          attach="material"
          color={color}
          depthTest={false}
          depthWrite={false}
          transparent
        />
      )}
    </Text>
  )
}

/**
 * A point label rendered as drei <Text> (troika), with subscripts drawn as a
 * separate smaller, lowered digit (the default font lacks ₀–₉ glyphs). Place it
 * inside a <Billboard> so it faces the camera and is captured by toDataURL.
 */
export function LabelText({
  name,
  color,
  size,
  showThrough,
}: {
  name: string
  color: string
  /** Base font size; subscript and outline derive from this. */
  size: number
  showThrough: boolean
}) {
  const { base, sub } = splitLabel(name)
  const outline = size * OUTLINE_RATIO

  if (sub === '') {
    return (
      <Glyph
        color={color}
        fontSize={size}
        outlineWidth={outline}
        anchorX="center"
        showThrough={showThrough}
      >
        {base}
      </Glyph>
    )
  }

  return (
    <>
      <Glyph
        color={color}
        fontSize={size}
        outlineWidth={outline}
        anchorX="right"
        showThrough={showThrough}
      >
        {base}
      </Glyph>
      <Glyph
        color={color}
        fontSize={size * SUB_RATIO}
        outlineWidth={outline}
        anchorX="left"
        position={[size * SUB_DX, size * SUB_DY, 0]}
        showThrough={showThrough}
      >
        {sub}
      </Glyph>
    </>
  )
}
