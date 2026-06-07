// Single source of truth for the app: shape selection, parameters, display
// toggles, appearance, camera and export settings. UI and the 3D scene both
// read from here; geometry is recomputed as a pure function of {type, params}.
import { create } from 'zustand'
import type { ParamValues, ShapeType } from '../geometry/types'
import { SHAPE_DEFS } from '../geometry/shapes'
import type { ExportBackground, ExportScale } from '../export/export'

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
}

export interface ExportSettings {
  background: ExportBackground
  scale: ExportScale
}

export interface StoreState {
  shapeType: ShapeType
  /** Parameter values per shape, so switching back restores prior dimensions. */
  paramsByShape: Record<ShapeType, ParamValues>
  display: DisplayState
  appearance: AppearanceState

  /** Last requested quick view, re-applied whenever viewNonce changes. */
  view: ViewPreset
  viewNonce: number
  cameraLocked: boolean

  exportSettings: ExportSettings
  /** Bumped to request a PNG capture from the ExportController. */
  exportNonce: number

  setShape: (type: ShapeType) => void
  setParam: (key: string, value: number) => void
  toggleDisplay: (key: DisplayKey) => void
  setView: (preset: ViewPreset) => void
  resetView: () => void
  toggleLock: () => void
  setExportBackground: (background: ExportBackground) => void
  setExportScale: (scale: ExportScale) => void
  requestExport: () => void
}

function initialParamsByShape(): Record<ShapeType, ParamValues> {
  const out = {} as Record<ShapeType, ParamValues>
  for (const def of SHAPE_DEFS) {
    out[def.type] = { ...def.defaults }
  }
  return out
}

const DEFAULT_VIEW: ViewPreset = 'iso'

export const useStore = create<StoreState>((set) => ({
  shapeType: 'cube',
  paramsByShape: initialParamsByShape(),
  display: { faces: true, edges: true, vertices: true, labels: true },
  appearance: {
    figureColor: '#4f8ff7',
    faceOpacity: 0.85,
    edgeColor: '#1b2330',
    edgeWidth: 2,
    edgeStyle: 'solid',
    vertexColor: '#1b2330',
    vertexSize: 0.06,
    labelColor: '#0f172a',
  },
  view: DEFAULT_VIEW,
  viewNonce: 0,
  cameraLocked: false,
  exportSettings: { background: 'transparent', scale: 2 },
  exportNonce: 0,

  setShape: (type) => set({ shapeType: type }),
  setParam: (key, value) =>
    set((s) => ({
      paramsByShape: {
        ...s.paramsByShape,
        [s.shapeType]: { ...s.paramsByShape[s.shapeType], [key]: value },
      },
    })),
  toggleDisplay: (key) =>
    set((s) => ({ display: { ...s.display, [key]: !s.display[key] } })),
  setView: (preset) => set((s) => ({ view: preset, viewNonce: s.viewNonce + 1 })),
  resetView: () =>
    set((s) => ({ view: DEFAULT_VIEW, viewNonce: s.viewNonce + 1 })),
  toggleLock: () => set((s) => ({ cameraLocked: !s.cameraLocked })),
  setExportBackground: (background) =>
    set((s) => ({ exportSettings: { ...s.exportSettings, background } })),
  setExportScale: (scale) =>
    set((s) => ({ exportSettings: { ...s.exportSettings, scale } })),
  requestExport: () => set((s) => ({ exportNonce: s.exportNonce + 1 })),
}))
