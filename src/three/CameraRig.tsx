import { type ComponentRef, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from '../geometry/types'
import { boundingRadius } from '../geometry/bounds'
import { useStore } from '../state/useStore'
import { useSolid } from '../state/useSolid'
import type { ViewPreset } from '../state/useStore'

const VIEW_DIRECTION: Record<ViewPreset, Vec3> = {
  front: [0, 0, 1],
  side: [1, 0, 0],
  top: [0, 1, 0],
  iso: [0.7, 0.6, 0.7],
}
const DEFAULT_UP: Vec3 = [0, 1, 0]
const TOP_UP: Vec3 = [0, 0, -1]
const FRAME_MARGIN = 1.5
const MIN_ZOOM_DISTANCE = 0.5
const MAX_ZOOM_DISTANCE = 100

/**
 * OrbitControls plus quick-view presets and a lock toggle. Presets are applied
 * imperatively whenever viewNonce changes; locking disables the controls so the
 * viewpoint is frozen before export.
 */
export function CameraRig() {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera

  const view = useStore((s) => s.view)
  const viewNonce = useStore((s) => s.viewNonce)
  const locked = useStore((s) => s.cameraLocked)
  const zoomFactor = useStore((s) => s.zoomFactor)
  const zoomNonce = useStore((s) => s.zoomNonce)
  const sectionPointDragging = useStore((s) => s.section.draggingPoint)

  // Keep the latest framing radius in a ref so adjusting dimensions does not
  // snap the camera; presets/reset read it when they re-frame.
  const solid = useSolid()
  const radius = Math.max(boundingRadius(solid), 0.001)
  const radiusRef = useRef(radius)
  useEffect(() => {
    radiusRef.current = radius
  })

  useEffect(() => {
    applyView(camera, controlsRef.current, view, radiusRef.current)
    // viewNonce drives re-application even when the preset is unchanged.
  }, [camera, view, viewNonce])

  // The +/- zoom buttons bump zoomNonce; dolly the camera toward/away from the
  // target. Skipped when locked so a frozen viewpoint stays frozen.
  const lastZoom = useRef(zoomNonce)
  useEffect(() => {
    if (zoomNonce === lastZoom.current) return
    lastZoom.current = zoomNonce
    if (locked) return
    applyZoom(camera, controlsRef.current, zoomFactor)
  }, [camera, locked, zoomFactor, zoomNonce])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!locked && !sectionPointDragging}
      target={[0, 0, 0]}
    />
  )
}

function applyView(
  camera: THREE.PerspectiveCamera,
  controls: ComponentRef<typeof OrbitControls> | null,
  preset: ViewPreset,
  radius: number,
): void {
  const fovRad = (camera.fov * Math.PI) / 180
  const distance = (radius / Math.sin(fovRad / 2)) * FRAME_MARGIN
  const dir = VIEW_DIRECTION[preset]
  camera.position.set(dir[0] * distance, dir[1] * distance, dir[2] * distance)
  const up = preset === 'top' ? TOP_UP : DEFAULT_UP
  camera.up.set(up[0], up[1], up[2])
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
  if (controls) {
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

/** Dolly the camera toward (factor<1) or away from (factor>1) the orbit target. */
function applyZoom(
  camera: THREE.PerspectiveCamera,
  controls: ComponentRef<typeof OrbitControls> | null,
  factor: number,
): void {
  const target = controls ? controls.target : new THREE.Vector3(0, 0, 0)
  const offset = camera.position.clone().sub(target)
  const distance = THREE.MathUtils.clamp(
    offset.length() * factor,
    MIN_ZOOM_DISTANCE,
    MAX_ZOOM_DISTANCE,
  )
  offset.setLength(distance)
  camera.position.copy(target).add(offset)
  camera.updateProjectionMatrix()
  if (controls) controls.update()
}
