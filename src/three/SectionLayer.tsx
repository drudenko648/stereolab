import { Billboard, Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { LabelText } from './LabelText'
import {
  edgeHostFromPoint,
  faceHostFromPoint,
  moveHostFromRay,
  resolveHostPoint,
  type SectionHost,
} from '../geometry/section/constraints'
import {
  sectionMeshForSolid,
  type SectionMesh,
} from '../geometry/section/mesh'
import type { Solid, Vec3 } from '../geometry/types'
import { distance } from '../geometry/math'
import { useStore, type SectionPoint } from '../state/useStore'
import { v3 } from './util'

const TARGET_COLOR = '#0ea5e9'
const CONTROL_COLOR = '#f97316'
const CLICK_DELTA = 4
export const SECTION_EDITING_GROUP = 'section-editing-affordances'

export function SectionLayer({ solid }: { solid: Solid }) {
  const section = useStore((state) => state.section)
  const mesh = useMemo(() => sectionMeshForSolid(solid), [solid])
  if (!mesh) return null

  return (
    <group>
      {section.polygon.length >= 3 && (
        <SectionPolygon points={section.polygon} />
      )}
      {section.enabled && (
        <group name={SECTION_EDITING_GROUP}>
          <SectionInteractionTargets mesh={mesh} />
          {section.points.map((point) => (
            <SectionControlPoint
              key={point.id}
              point={point}
              mesh={mesh}
              enabled
            />
          ))}
        </group>
      )}
    </group>
  )
}

const SECTION_LABEL_BASE = 0.22

function SectionPolygon({
  points,
}: {
  points: readonly Vec3[]
}) {
  const appearance = useStore((state) => state.section.appearance)
  const vertexNames = useStore((state) => state.section.vertexNames)
  const enabled = useStore((state) => state.section.enabled)
  const startEditing = useStore((state) => state.startEditing)
  const geometry = useMemo(() => polygonGeometry(points), [points])
  useEffect(() => () => geometry.dispose(), [geometry])
  const closedPoints = [...points, points[0]]
  const labelSize = SECTION_LABEL_BASE * appearance.labelSize

  return (
    <group renderOrder={20}>
      <mesh geometry={geometry} renderOrder={20}>
        <meshBasicMaterial
          color={appearance.color}
          transparent
          opacity={appearance.opacity}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <Line
        points={closedPoints.map(v3)}
        color={appearance.outlineColor}
        lineWidth={appearance.outlineWidth}
        depthTest={false}
        renderOrder={21}
      />
      {points.map((point, index) => (
        <group key={index}>
          <Billboard position={v3(point)} renderOrder={22}>
            <group position={[0.12, 0.12, 0]}>
              <LabelText
                name={vertexNames[index] ?? `P${index + 1}`}
                color={appearance.labelColor}
                size={labelSize}
                showThrough
              />
            </group>
          </Billboard>
          {/* Invisible double-click target to rename this corner. Only when not
              editing, so it never competes with point placement/dragging. */}
          {!enabled && (
            <mesh
              position={v3(point)}
              onDoubleClick={(event) => {
                event.stopPropagation()
                startEditing({ kind: 'sectionVertex', index })
              }}
            >
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial colorWrite={false} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

function SectionInteractionTargets({ mesh }: { mesh: SectionMesh }) {
  const addPoint = useStore((state) => state.addSectionPoint)
  const vertexGeometry = useMemo(
    () => new THREE.SphereGeometry(0.13, 12, 12),
    [],
  )
  useEffect(() => () => vertexGeometry.dispose(), [vertexGeometry])

  return (
    <group>
      {mesh.vertices.map((position, vertexIndex) => (
        <mesh
          key={`vertex-${vertexIndex}`}
          geometry={vertexGeometry}
          position={v3(position)}
          renderOrder={31}
          onClick={(event) => {
            if (event.delta > CLICK_DELTA) return
            event.stopPropagation()
            addPoint({ kind: 'vertex', vertexIndex })
          }}
        >
          <meshBasicMaterial
            color={TARGET_COLOR}
            transparent
            opacity={0.28}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
      {mesh.edges.map((edge, edgeIndex) => (
        <Line
          key={`edge-${edgeIndex}`}
          points={[v3(mesh.vertices[edge.a]), v3(mesh.vertices[edge.b])]}
          color={TARGET_COLOR}
          lineWidth={9}
          transparent
          opacity={0.14}
          depthTest={false}
          renderOrder={30}
          onClick={(event) => {
            if (event.delta > CLICK_DELTA) return
            event.stopPropagation()
            addPoint(
              edgeHostFromPoint(
                mesh,
                edgeIndex,
                fromThreeVector(event.point),
              ),
            )
          }}
        />
      ))}
      {mesh.faces.map((_, faceIndex) => (
        <FaceTarget
          key={`face-${faceIndex}`}
          mesh={mesh}
          faceIndex={faceIndex}
          onPlace={addPoint}
        />
      ))}
    </group>
  )
}

function FaceTarget({
  mesh,
  faceIndex,
  onPlace,
}: {
  mesh: SectionMesh
  faceIndex: number
  onPlace: (host: SectionHost) => void
}) {
  const geometry = useMemo(
    () => faceGeometry(mesh, faceIndex),
    [faceIndex, mesh],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh
      geometry={geometry}
      onClick={(event) => {
        if (event.delta > CLICK_DELTA) return
        event.stopPropagation()
        onPlace(placementHost(mesh, faceIndex, fromThreeVector(event.point)))
      }}
    >
      <meshBasicMaterial
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function SectionControlPoint({
  point,
  mesh,
  enabled,
}: {
  point: SectionPoint
  mesh: SectionMesh
  enabled: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const updatePoint = useStore((state) => state.updateSectionPoint)
  const setPointDragging = useStore(
    (state) => state.setSectionPointDragging,
  )
  const position = resolveHostPoint(mesh, point.host)

  const beginDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!enabled || point.host.kind === 'vertex') return
    event.stopPropagation()
    setDragging(true)
    setPointDragging(true)
    pointerCaptureTarget(event).setPointerCapture(event.pointerId)
  }

  const drag = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging) return
    event.stopPropagation()
    updatePoint(
      point.id,
      moveHostFromRay(
        mesh,
        point.host,
        fromThreeVector(event.ray.origin),
        fromThreeVector(event.ray.direction),
      ),
    )
  }

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging) return
    event.stopPropagation()
    setDragging(false)
    setPointDragging(false)
    pointerCaptureTarget(event).releasePointerCapture(event.pointerId)
  }

  return (
    <mesh
      position={v3(position)}
      renderOrder={40}
      onPointerDown={beginDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial
        color={CONTROL_COLOR}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

function polygonGeometry(points: readonly Vec3[]): THREE.BufferGeometry {
  const positions: number[] = []
  for (let index = 1; index < points.length - 1; index++) {
    for (const point of [points[0], points[index], points[index + 1]]) {
      positions.push(point[0], point[1], point[2])
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.computeVertexNormals()
  return geometry
}

function faceGeometry(
  mesh: SectionMesh,
  faceIndex: number,
): THREE.BufferGeometry {
  const face = mesh.faces[faceIndex]
  const positions: number[] = []
  for (let index = 1; index < face.vertices.length - 1; index++) {
    for (const vertexIndex of [
      face.vertices[0],
      face.vertices[index],
      face.vertices[index + 1],
    ]) {
      const point = mesh.vertices[vertexIndex]
      positions.push(point[0], point[1], point[2])
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  return geometry
}

function fromThreeVector(vector: THREE.Vector3): Vec3 {
  return [vector.x, vector.y, vector.z]
}

function placementHost(
  mesh: SectionMesh,
  faceIndex: number,
  point: Vec3,
): SectionHost {
  let closestVertex = 0
  let vertexDistance = Infinity
  for (let index = 0; index < mesh.vertices.length; index++) {
    const candidateDistance = distance(point, mesh.vertices[index])
    if (candidateDistance < vertexDistance) {
      vertexDistance = candidateDistance
      closestVertex = index
    }
  }
  if (vertexDistance <= 0.16) {
    return { kind: 'vertex', vertexIndex: closestVertex }
  }

  let closestEdge: SectionHost | null = null
  let edgeDistance = Infinity
  for (let index = 0; index < mesh.edges.length; index++) {
    const host = edgeHostFromPoint(mesh, index, point)
    const candidateDistance = distance(point, resolveHostPoint(mesh, host))
    if (candidateDistance < edgeDistance) {
      edgeDistance = candidateDistance
      closestEdge = host
    }
  }
  if (closestEdge && edgeDistance <= 0.12) return closestEdge

  return faceHostFromPoint(mesh, faceIndex, point)
}

function pointerCaptureTarget(event: ThreeEvent<PointerEvent>): {
  setPointerCapture: (pointerId: number) => void
  releasePointerCapture: (pointerId: number) => void
} {
  return event.target as unknown as {
    setPointerCapture: (pointerId: number) => void
    releasePointerCapture: (pointerId: number) => void
  }
}
