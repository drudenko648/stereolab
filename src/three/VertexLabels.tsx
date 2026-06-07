import { Billboard, Text } from '@react-three/drei'
import type { Solid, Vec3 } from '../geometry/types'
import { length, normalize, scale } from '../geometry/math'
import { splitLabel } from '../geometry/naming'
import { useStore } from '../state/useStore'

const LABEL_OFFSET = 0.32
const BASE_SIZE = 0.3
const SUB_SIZE = 0.19
const OUTLINE = 0.018

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

/**
 * In-canvas vertex labels. Rendered with drei <Text> (troika) inside a
 * <Billboard> so they always face the camera AND are captured by toDataURL —
 * a DOM <Html> overlay would be missing from the exported PNG.
 *
 * Subscripts (A₁) are drawn as a separate, smaller, lowered digit rather than a
 * Unicode subscript glyph, because the default font lacks ₀–₉ glyphs.
 */
export function VertexLabels({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.labelColor)
  const showThrough = solid.surface !== undefined

  return (
    <group>
      {solid.vertices.map((vertex) => {
        const p = vertex.position
        // Push the label slightly outward from the centre so it clears the body.
        const dir: Vec3 = length(p) === 0 ? [0, 1, 0] : normalize(p)
        const offset = scale(dir, LABEL_OFFSET)
        const { base, sub } = splitLabel(vertex.name)
        return (
          <Billboard
            key={vertex.id}
            position={[p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]]}
            renderOrder={showThrough ? 10 : 0}
          >
            {sub === '' ? (
              <Text
                fontSize={BASE_SIZE}
                color={color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={OUTLINE}
                outlineColor="#ffffff"
                depthOffset={showThrough ? -10 : 0}
                onSync={showThrough ? showThroughSurfaces : undefined}
                renderOrder={showThrough ? 10 : 0}
              >
                {base}
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
            ) : (
              <>
                <Text
                  fontSize={BASE_SIZE}
                  color={color}
                  anchorX="right"
                  anchorY="middle"
                  outlineWidth={OUTLINE}
                  outlineColor="#ffffff"
                  depthOffset={showThrough ? -10 : 0}
                  onSync={showThrough ? showThroughSurfaces : undefined}
                  renderOrder={showThrough ? 10 : 0}
                >
                  {base}
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
                <Text
                  position={[0.03, -0.08, 0]}
                  fontSize={SUB_SIZE}
                  color={color}
                  anchorX="left"
                  anchorY="middle"
                  outlineWidth={OUTLINE}
                  outlineColor="#ffffff"
                  depthOffset={showThrough ? -10 : 0}
                  onSync={showThrough ? showThroughSurfaces : undefined}
                  renderOrder={showThrough ? 10 : 0}
                >
                  {sub}
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
              </>
            )}
          </Billboard>
        )
      })}
    </group>
  )
}
