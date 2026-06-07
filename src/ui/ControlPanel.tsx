import type { ReactNode } from 'react'
import { strings } from './strings'
import { ShapePicker } from './ShapePicker'
import { ShapeParams } from './ShapeParams'
import { DisplayControls } from './DisplayControls'
import { CameraControls } from './CameraControls'
import { ExportControls } from './ExportControls'
import { AppearanceControls } from './AppearanceControls'
import { VertexRenameControls } from './VertexRenameControls'
import { SectionControls } from './SectionControls'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-200 p-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** The teacher-facing control panel: shape, dimensions, display, camera, export. */
export function ControlPanel() {
  return (
    <div className="flex flex-col">
      <header className="p-4">
        <h1 className="text-lg font-semibold text-slate-900">
          {strings.appTitle}
        </h1>
        <p className="text-xs text-slate-500">{strings.appSubtitle}</p>
      </header>
      <Section title={strings.panel.shape}>
        <ShapePicker />
      </Section>
      <Section title={strings.panel.dimensions}>
        <ShapeParams />
      </Section>
      <Section title={strings.panel.display}>
        <DisplayControls />
      </Section>
      <Section title={strings.panel.appearance}>
        <AppearanceControls />
      </Section>
      <Section title={strings.panel.naming}>
        <VertexRenameControls />
      </Section>
      <Section title={strings.panel.section}>
        <SectionControls />
      </Section>
      <Section title={strings.panel.camera}>
        <CameraControls />
      </Section>
      <Section title={strings.panel.export}>
        <ExportControls />
      </Section>
    </div>
  )
}
