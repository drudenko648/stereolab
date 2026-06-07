import { Line } from '@react-three/drei'
import type { Solid } from '../geometry/types'
import { useStore } from '../state/useStore'
import { v3 } from './util'

/**
 * Renders solid edges with drei <Line> (fat lines), which — unlike raw WebGL
 * lines — honours lineWidth and dashed styles across platforms.
 */
export function EdgesView({ solid }: { solid: Solid }) {
  const color = useStore((s) => s.appearance.edgeColor)
  const width = useStore((s) => s.appearance.edgeWidth)
  const dashed = useStore((s) => s.appearance.edgeStyle === 'dashed')

  return (
    <group>
      {solid.edges.map((edge, i) => (
        <Line
          key={i}
          points={[
            v3(solid.vertices[edge.a].position),
            v3(solid.vertices[edge.b].position),
          ]}
          color={color}
          lineWidth={width}
          dashed={dashed}
          dashSize={0.18}
          gapSize={0.12}
        />
      ))}
    </group>
  )
}
