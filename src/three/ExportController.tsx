import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../state/useStore'
import { backgroundSettings, exportFilename } from '../export/export'
import { SECTION_EDITING_GROUP } from './SectionLayer'

/**
 * Captures the WebGL canvas to a PNG when an export is requested. Rendering and
 * read-back happen in the same synchronous block so the captured frame is never
 * stale (Section 4.2). High resolution is achieved by temporarily bumping the
 * device pixel ratio; the background is applied and then restored.
 */
export function ExportController() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  const exportNonce = useStore((s) => s.exportNonce)
  const settings = useStore((s) => s.exportSettings)
  const shapeType = useStore((s) => s.shapeType)
  // Track the last handled nonce. Initialising to the current value means a
  // mount never triggers a capture — and, unlike a boolean "first run" flag,
  // this stays correct under React StrictMode's double-invoked mount effects.
  const lastExport = useRef(exportNonce)

  useEffect(() => {
    if (exportNonce === lastExport.current) return
    lastExport.current = exportNonce

    const { background, scale } = settings
    const bg = backgroundSettings(background)
    const { width, height } = size

    const prevBackground = scene.background
    const prevClearColor = gl.getClearColor(new THREE.Color())
    const prevClearAlpha = gl.getClearAlpha()
    const prevPixelRatio = gl.getPixelRatio()
    const editingAffordances = scene.getObjectByName(SECTION_EDITING_GROUP)
    const editingVisible = editingAffordances?.visible

    try {
      if (editingAffordances) editingAffordances.visible = false
      if (bg.color === null) {
        scene.background = null
        gl.setClearColor(0x000000, 0)
      } else {
        const color = new THREE.Color(bg.color)
        scene.background = color
        gl.setClearColor(color, bg.alpha)
      }
      gl.setPixelRatio(scale)
      gl.setSize(width, height, false)
      gl.render(scene, camera)
      const url = gl.domElement.toDataURL('image/png')
      triggerDownload(url, exportFilename(shapeType))
    } finally {
      gl.setPixelRatio(prevPixelRatio)
      gl.setSize(width, height, false)
      scene.background = prevBackground
      gl.setClearColor(prevClearColor, prevClearAlpha)
      if (editingAffordances && editingVisible !== undefined) {
        editingAffordances.visible = editingVisible
      }
      gl.render(scene, camera)
    }
    // Only the export request should trigger a capture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportNonce])

  return null
}

function triggerDownload(dataUrl: string, filename: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
