import { Canvas } from '@react-three/fiber'
import { useStore } from '../state/useStore'
import { useSolid } from '../state/useSolid'
import { SolidMesh } from './SolidMesh'
import { EdgesView } from './EdgesView'
import { VertexPoints } from './VertexPoints'
import { VertexLabels } from './VertexLabels'
import { CameraRig } from './CameraRig'
import { ExportController } from './ExportController'
import { SectionLayer } from './SectionLayer'

/** The 3D viewport: a single WebGL canvas wired to the store. */
export function Scene() {
  const display = useStore((s) => s.display)
  const solid = useSolid()

  return (
    <Canvas
      // preserveDrawingBuffer + alpha are required for transparent PNG export.
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ fov: 45, position: [6, 5, 6], near: 0.1, far: 1000 }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 9, 7]} intensity={1.1} />
      <directionalLight position={[-7, -4, -6]} intensity={0.35} />

      {display.faces && <SolidMesh solid={solid} />}
      {display.edges && <EdgesView solid={solid} />}
      {display.vertices && <VertexPoints solid={solid} />}
      {display.labels && <VertexLabels solid={solid} />}
      <SectionLayer solid={solid} />

      <CameraRig />
      <ExportController />
    </Canvas>
  )
}
