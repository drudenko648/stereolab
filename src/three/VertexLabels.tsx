import { Billboard, Text } from '@react-three/drei'
import type { Solid, Vec3 } from '../geometry/types'
import { length, normalize, scale } from '../geometry/math'
import { useStore } from '../state/useStore'

const LABEL_OFFSET = 0.32
const LABEL_SIZE = 0.3

/**
 * In-canvas vertex labels. Rendered with drei <Text> (troika) inside a
 * <Billboard> so they always face the camera AND are captured by toDataURL —
 * a DOM <Html> overlay would be missing from the exported PNG.
 */
export function VertexLabels({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.labelColor)

  return (
    <group>
      {solid.vertices.map((vertex) => {
        const p = vertex.position
        // Push the label slightly outward from the centre so it clears the body.
        const dir: Vec3 = length(p) === 0 ? [0, 1, 0] : normalize(p)
        const offset = scale(dir, LABEL_OFFSET)
        return (
          <Billboard
            key={vertex.id}
            position={[p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]]}
          >
            <Text
              fontSize={LABEL_SIZE}
              color={color}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.018}
              outlineColor="#ffffff"
            >
              {vertex.name}
            </Text>
          </Billboard>
        )
      })}
    </group>
  )
}
