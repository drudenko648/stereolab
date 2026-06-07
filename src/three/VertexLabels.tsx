import { Billboard } from '@react-three/drei'
import type { Solid, Vec3 } from '../geometry/types'
import { length, normalize, scale } from '../geometry/math'
import { useStore } from '../state/useStore'
import { LabelText } from './LabelText'

const LABEL_OFFSET = 0.32
const BASE_SIZE = 0.3

/**
 * In-canvas vertex labels. Each label is a <Billboard> (always faces the camera
 * and is captured by toDataURL — a DOM <Html> overlay would be missing from the
 * exported PNG) wrapping the shared <LabelText>.
 *
 * The group is keyed by solid.type so switching shape never reuses a previous
 * shape's label instances (which left A/B unrendered after a cylinder switch).
 */
export function VertexLabels({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.labelColor)
  const labelSize = useStore((s) => s.appearance.labelSize)
  const showThrough = solid.surface !== undefined
  const size = BASE_SIZE * labelSize

  return (
    <group key={solid.type}>
      {solid.vertices.map((vertex) => {
        const p = vertex.position
        // Push the label slightly outward from the centre so it clears the body.
        const dir: Vec3 = length(p) === 0 ? [0, 1, 0] : normalize(p)
        const offset = scale(dir, LABEL_OFFSET)
        return (
          <Billboard
            key={vertex.id}
            position={[p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]]}
            renderOrder={showThrough ? 10 : 0}
          >
            <LabelText
              name={vertex.name}
              color={color}
              size={size}
              showThrough={showThrough}
            />
          </Billboard>
        )
      })}
    </group>
  )
}
