// Single source of truth for the app: shape selection, parameters, display
// toggles, appearance, camera and export settings. UI and the 3D scene both
// read from here; geometry is recomputed as a pure function of {type, params}.
import { create } from 'zustand'
import type { ParamValues, ShapeType, Vec3 } from '../geometry/types'
import { generateSolid, SHAPE_DEFS } from '../geometry/shapes'
import {
  applyVertexNames,
  validateVertexName,
  type VertexNameValidation,
} from '../geometry/rename'
import type { ExportBackground, ExportScale } from '../export/export'
import {
  resolveHostPoint,
  type SectionHost,
} from '../geometry/section/constraints'
import {
  planeFromPoints,
  signedDistance,
  type SectionPlane,
} from '../geometry/section/plane'
import { intersectConvexMesh } from '../geometry/section/intersect'
import { sectionMeshForSolid } from '../geometry/section/mesh'
import { distance } from '../geometry/math'

export type ViewPreset = 'front' | 'top' | 'side' | 'iso'
export type DisplayKey = 'faces' | 'edges' | 'vertices' | 'labels'
export type EdgeStyle = 'solid' | 'dashed'

export type DisplayState = Record<DisplayKey, boolean>

export interface AppearanceState {
  figureColor: string
  faceOpacity: number
  edgeColor: string
  edgeWidth: number
  edgeStyle: EdgeStyle
  vertexColor: string
  vertexSize: number
  labelColor: string
  /** Multiplier applied to the base vertex-label font size. */
  labelSize: number
}

export interface ExportSettings {
  background: ExportBackground
  scale: ExportScale
}

export interface SectionPoint {
  readonly id: number
  readonly host: SectionHost
}

export interface SectionAppearanceState {
  color: string
  opacity: number
  outlineColor: string
  outlineWidth: number
  labelColor: string
  /** Multiplier applied to the base section-corner label font size. */
  labelSize: number
}

/** Which label is currently being edited via the in-canvas floating editor. */
export type EditingTarget =
  | { readonly kind: 'vertex'; readonly id: number }
  | { readonly kind: 'sectionVertex'; readonly index: number }

export type SectionStatus =
  | 'needPoints'
  | 'coincident'
  | 'collinear'
  | 'empty'
  | 'ready'
  | 'unsupported'

export interface SectionState {
  enabled: boolean
  draggingPoint: boolean
  points: readonly SectionPoint[]
  plane: SectionPlane | null
  polygon: readonly Vec3[]
  status: SectionStatus
  approximate: boolean
  appearance: SectionAppearanceState
  /** Custom names for section corners, keyed by polygon-vertex index. */
  vertexNames: Record<number, string>
  nextPointId: number
}

export interface StoreState {
  shapeType: ShapeType
  /** Parameter values per shape, so switching back restores prior dimensions. */
  paramsByShape: Record<ShapeType, ParamValues>
  vertexNamesByShape: Record<ShapeType, Record<number, string>>
  display: DisplayState
  appearance: AppearanceState

  /** Last requested quick view, re-applied whenever viewNonce changes. */
  view: ViewPreset
  viewNonce: number
  cameraLocked: boolean
  /** Last requested zoom factor, applied whenever zoomNonce changes. */
  zoomFactor: number
  zoomNonce: number

  exportSettings: ExportSettings
  /** Bumped to request a PNG capture from the ExportController. */
  exportNonce: number
  section: SectionState
  /** Label currently open in the in-canvas floating editor, if any. */
  editing: EditingTarget | null

  setShape: (type: ShapeType) => void
  setParam: (key: string, value: number) => void
  toggleDisplay: (key: DisplayKey) => void
  setAppearance: <K extends keyof AppearanceState>(
    key: K,
    value: AppearanceState[K],
  ) => void
  renameVertex: (id: number, name: string) => VertexNameValidation
  resetVertexNames: () => void
  setView: (preset: ViewPreset) => void
  resetView: () => void
  toggleLock: () => void
  requestZoom: (factor: number) => void
  setExportBackground: (background: ExportBackground) => void
  setExportScale: (scale: ExportScale) => void
  requestExport: () => void
  toggleSectionMode: () => void
  setSectionPointDragging: (dragging: boolean) => void
  clearSection: () => void
  addSectionPoint: (host: SectionHost) => void
  updateSectionPoint: (id: number, host: SectionHost) => void
  removeSectionPoint: (id: number) => void
  setSectionAppearance: <K extends keyof SectionAppearanceState>(
    key: K,
    value: SectionAppearanceState[K],
  ) => void
  setSectionVertexName: (index: number, name: string) => VertexNameValidation
  startEditing: (target: EditingTarget) => void
  stopEditing: () => void
}

function initialParamsByShape(): Record<ShapeType, ParamValues> {
  const out = {} as Record<ShapeType, ParamValues>
  for (const def of SHAPE_DEFS) {
    out[def.type] = { ...def.defaults }
  }
  return out
}

function initialVertexNamesByShape(): Record<
  ShapeType,
  Record<number, string>
> {
  return Object.fromEntries(
    SHAPE_DEFS.map((def) => [def.type, {}]),
  ) as Record<ShapeType, Record<number, string>>
}

const DEFAULT_VIEW: ViewPreset = 'iso'

/** Clicking within this distance of an existing section point removes it. */
const SECTION_DEDUP_RADIUS = 0.15
/** A placed point counts as "on the section" if within this of the plane. */
const SECTION_ON_PLANE_EPSILON = 1e-6

const DEFAULT_SECTION_APPEARANCE: SectionAppearanceState = {
  color: '#f43f5e',
  opacity: 0.45,
  outlineColor: '#9f1239',
  outlineWidth: 3,
  labelColor: '#9f1239',
  labelSize: 1,
}

function emptySection(
  enabled = false,
  appearance = DEFAULT_SECTION_APPEARANCE,
): SectionState {
  return {
    enabled,
    draggingPoint: false,
    points: [],
    plane: null,
    polygon: [],
    status: 'needPoints',
    approximate: false,
    appearance,
    vertexNames: {},
    nextPointId: 1,
  }
}

function deriveSection(
  type: ShapeType,
  params: ParamValues,
  section: SectionState,
): SectionState {
  const mesh = sectionMeshForSolid(generateSolid(type, params))
  if (!mesh) {
    return {
      ...section,
      points: [],
      plane: null,
      polygon: [],
      status: 'unsupported',
      approximate: false,
    }
  }

  const positions = section.points.map((point) =>
    resolveHostPoint(mesh, point.host),
  )
  const planeResult = planeFromPoints(positions)
  if (!planeResult.ok) {
    return {
      ...section,
      plane: null,
      polygon: [],
      status:
        planeResult.reason === 'tooFew' ? 'needPoints' : planeResult.reason,
      approximate: mesh.approximate,
    }
  }

  const polygon = intersectConvexMesh(mesh, planeResult.plane)
  return {
    ...section,
    plane: planeResult.plane,
    polygon,
    status: polygon.length >= 3 ? 'ready' : 'empty',
    approximate: mesh.approximate,
  }
}

export const useStore = create<StoreState>((set, get) => ({
  shapeType: 'cube',
  paramsByShape: initialParamsByShape(),
  vertexNamesByShape: initialVertexNamesByShape(),
  display: { faces: true, edges: true, vertices: true, labels: true },
  appearance: {
    figureColor: '#4f8ff7',
    faceOpacity: 0.50,
    edgeColor: '#1b2330',
    edgeWidth: 2,
    edgeStyle: 'solid',
    vertexColor: '#1b2330',
    vertexSize: 0.03,
    labelColor: '#0f172a',
    labelSize: 1,
  },
  view: DEFAULT_VIEW,
  viewNonce: 0,
  cameraLocked: false,
  zoomFactor: 1,
  zoomNonce: 0,
  exportSettings: { background: 'transparent', scale: 2 },
  exportNonce: 0,
  section: emptySection(),
  editing: null,

  setShape: (type) =>
    set((s) => ({
      shapeType: type,
      viewNonce: s.viewNonce + 1,
      editing: null,
      section: deriveSection(
        type,
        s.paramsByShape[type],
        emptySection(s.section.enabled, s.section.appearance),
      ),
    })),
  setParam: (key, value) =>
    set((s) => {
      const nextParams = {
        ...s.paramsByShape,
        [s.shapeType]: { ...s.paramsByShape[s.shapeType], [key]: value },
      }
      return {
        paramsByShape: nextParams,
        section: deriveSection(
          s.shapeType,
          nextParams[s.shapeType],
          emptySection(s.section.enabled, s.section.appearance),
        ),
        ...(key === 'sides'
          ? {
              vertexNamesByShape: {
                ...s.vertexNamesByShape,
                [s.shapeType]: {},
              },
            }
          : {}),
      }
    }),
  toggleDisplay: (key) =>
    set((s) => ({ display: { ...s.display, [key]: !s.display[key] } })),
  setAppearance: (key, value) =>
    set((s) => ({ appearance: { ...s.appearance, [key]: value } })),
  renameVertex: (id, name) => {
    const state = get()
    const type = state.shapeType
    const overrides = state.vertexNamesByShape[type]
    const solid = applyVertexNames(
      generateSolid(type, state.paramsByShape[type]),
      overrides,
    )
    const existingNames = solid.vertices
      .filter((vertex) => vertex.id !== id)
      .map((vertex) => vertex.name)
    const result = validateVertexName(name, existingNames)
    if (!result.ok) return result

    set((s) => ({
      vertexNamesByShape: {
        ...s.vertexNamesByShape,
        [type]: { ...s.vertexNamesByShape[type], [id]: result.value },
      },
    }))
    return result
  },
  resetVertexNames: () =>
    set((s) => ({
      vertexNamesByShape: {
        ...s.vertexNamesByShape,
        [s.shapeType]: {},
      },
    })),
  setView: (preset) => set((s) => ({ view: preset, viewNonce: s.viewNonce + 1 })),
  resetView: () =>
    set((s) => ({ view: DEFAULT_VIEW, viewNonce: s.viewNonce + 1 })),
  toggleLock: () => set((s) => ({ cameraLocked: !s.cameraLocked })),
  requestZoom: (factor) =>
    set((s) => ({ zoomFactor: factor, zoomNonce: s.zoomNonce + 1 })),
  setExportBackground: (background) =>
    set((s) => ({ exportSettings: { ...s.exportSettings, background } })),
  setExportScale: (scale) =>
    set((s) => ({ exportSettings: { ...s.exportSettings, scale } })),
  requestExport: () => set((s) => ({ exportNonce: s.exportNonce + 1 })),
  toggleSectionMode: () =>
    set((s) => {
      const finishing = s.section.enabled
      // On finishing, drop points that don't lie on the section plane: only the
      // first three define the plane, so extra points placed afterwards that
      // miss it never appear in the section and shouldn't clutter the list.
      if (finishing && s.section.plane) {
        const mesh = sectionMeshForSolid(
          generateSolid(s.shapeType, s.paramsByShape[s.shapeType]),
        )
        if (mesh) {
          const plane = s.section.plane
          const kept = s.section.points.filter(
            (point) =>
              Math.abs(
                signedDistance(plane, resolveHostPoint(mesh, point.host)),
              ) <= SECTION_ON_PLANE_EPSILON,
          )
          return {
            section: deriveSection(s.shapeType, s.paramsByShape[s.shapeType], {
              ...s.section,
              enabled: false,
              draggingPoint: false,
              points: kept,
            }),
          }
        }
      }
      return {
        section: {
          ...s.section,
          enabled: !s.section.enabled,
          draggingPoint: false,
        },
      }
    }),
  setSectionPointDragging: (draggingPoint) =>
    set((s) => ({ section: { ...s.section, draggingPoint } })),
  clearSection: () =>
    set((s) => ({
      section: deriveSection(
        s.shapeType,
        s.paramsByShape[s.shapeType],
        emptySection(s.section.enabled, s.section.appearance),
      ),
    })),
  addSectionPoint: (host) =>
    set((s) => {
      const mesh = sectionMeshForSolid(
        generateSolid(s.shapeType, s.paramsByShape[s.shapeType]),
      )
      if (!mesh) return s
      // Toggle behaviour: clicking on (or very near) an existing point removes
      // it instead of stacking a duplicate at the same spot.
      const target = resolveHostPoint(mesh, host)
      const existing = s.section.points.find(
        (point) =>
          distance(resolveHostPoint(mesh, point.host), target) <=
          SECTION_DEDUP_RADIUS,
      )
      const section: SectionState = existing
        ? {
            ...s.section,
            points: s.section.points.filter(
              (point) => point.id !== existing.id,
            ),
          }
        : {
            ...s.section,
            points: [...s.section.points, { id: s.section.nextPointId, host }],
            nextPointId: s.section.nextPointId + 1,
          }
      return {
        section: deriveSection(
          s.shapeType,
          s.paramsByShape[s.shapeType],
          section,
        ),
      }
    }),
  updateSectionPoint: (id, host) =>
    set((s) => ({
      section: deriveSection(
        s.shapeType,
        s.paramsByShape[s.shapeType],
        {
          ...s.section,
          points: s.section.points.map((point) =>
            point.id === id ? { ...point, host } : point,
          ),
        },
      ),
    })),
  removeSectionPoint: (id) =>
    set((s) => ({
      section: deriveSection(
        s.shapeType,
        s.paramsByShape[s.shapeType],
        {
          ...s.section,
          points: s.section.points.filter((point) => point.id !== id),
        },
      ),
    })),
  setSectionAppearance: (key, value) =>
    set((s) => ({
      section: {
        ...s.section,
        appearance: { ...s.section.appearance, [key]: value },
      },
    })),
  setSectionVertexName: (index, name) => {
    const state = get()
    const cornerCount = state.section.polygon.length
    const existingNames = Array.from({ length: cornerCount }, (_, i) =>
      i === index
        ? null
        : (state.section.vertexNames[i] ?? `P${i + 1}`),
    ).filter((value): value is string => value !== null)
    const result = validateVertexName(name, existingNames)
    if (!result.ok) return result
    set((s) => ({
      section: {
        ...s.section,
        vertexNames: { ...s.section.vertexNames, [index]: result.value },
      },
    }))
    return result
  },
  startEditing: (target) => set({ editing: target }),
  stopEditing: () => set({ editing: null }),
}))
