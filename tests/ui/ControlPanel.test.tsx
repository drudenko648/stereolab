import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ControlPanel } from '../../src/ui/ControlPanel'
import { useStore } from '../../src/state/useStore'
import { strings } from '../../src/ui/strings'

const get = () => useStore.getState()

describe('ControlPanel', () => {
  it('renders all Stage 2 sections', () => {
    render(<ControlPanel />)
    for (const title of Object.values(strings.panel)) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })

  it('changes the shape via the picker', () => {
    render(<ControlPanel />)
    const picker = screen.getByLabelText(strings.panel.shape)
    fireEvent.change(picker, { target: { value: 'tetrahedron' } })
    expect(get().shapeType).toBe('tetrahedron')
  })

  it('shows parameter sliders for the current shape and updates the store', () => {
    render(<ControlPanel />)
    const slider = screen.getByLabelText(strings.params.size)
    fireEvent.change(slider, { target: { value: '3.5' } })
    expect(get().paramsByShape.cube.size).toBeCloseTo(3.5)
  })

  it('toggles a display flag from its checkbox', () => {
    render(<ControlPanel />)
    const faces = screen.getByLabelText(strings.display.faces)
    expect(faces).toBeChecked()
    fireEvent.click(faces)
    expect(get().display.faces).toBe(false)
  })

  it('updates all appearance controls', () => {
    render(<ControlPanel />)
    fireEvent.change(screen.getByLabelText(strings.appearance.figureColor), {
      target: { value: '#123456' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.faceOpacity), {
      target: { value: '0.4' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.edgeColor), {
      target: { value: '#abcdef' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.edgeWidth), {
      target: { value: '5' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.edgeStyle), {
      target: { value: 'dashed' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.vertexColor), {
      target: { value: '#fedcba' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.vertexSize), {
      target: { value: '0.14' },
    })
    fireEvent.change(screen.getByLabelText(strings.appearance.labelColor), {
      target: { value: '#334455' },
    })

    expect(get().appearance).toEqual({
      figureColor: '#123456',
      faceOpacity: 0.4,
      edgeColor: '#abcdef',
      edgeWidth: 5,
      edgeStyle: 'dashed',
      vertexColor: '#fedcba',
      vertexSize: 0.14,
      labelColor: '#334455',
    })
  })

  it('renames a vertex, validates duplicates, and resets auto-naming', () => {
    render(<ControlPanel />)
    const name = screen.getByLabelText(strings.rename.name)
    fireEvent.change(name, { target: { value: 'P' } })
    fireEvent.click(screen.getByText(strings.rename.apply))
    expect(get().vertexNamesByShape.cube).toEqual({ 0: 'P' })

    fireEvent.change(screen.getByLabelText(strings.rename.vertex), {
      target: { value: '1' },
    })
    fireEvent.change(name, { target: { value: 'P' } })
    fireEvent.click(screen.getByText(strings.rename.apply))
    expect(screen.getByText(strings.rename.errors.duplicate)).toBeInTheDocument()

    fireEvent.click(screen.getByText(strings.rename.reset))
    expect(get().vertexNamesByShape.cube).toEqual({})
  })

  it('applies a quick view and toggles the lock', () => {
    render(<ControlPanel />)
    fireEvent.click(screen.getByText(strings.camera.top))
    expect(get().view).toBe('top')
    expect(get().viewNonce).toBeGreaterThan(0)

    fireEvent.click(screen.getByText(strings.camera.lock))
    expect(get().cameraLocked).toBe(true)
  })

  it('drives export settings and the download trigger', () => {
    render(<ControlPanel />)
    fireEvent.change(screen.getByLabelText(strings.export.background), {
      target: { value: 'dark' },
    })
    fireEvent.change(screen.getByLabelText(strings.export.resolution), {
      target: { value: '4' },
    })
    expect(get().exportSettings).toEqual({ background: 'dark', scale: 4 })

    fireEvent.click(screen.getByText(strings.export.download))
    expect(get().exportNonce).toBe(1)
  })

  it('enters section mode, shows point state, removes, and clears points', () => {
    render(<ControlPanel />)
    fireEvent.click(screen.getByText(strings.section.enable))
    expect(get().section.enabled).toBe(true)
    expect(screen.getByRole('alert')).toHaveTextContent(
      strings.section.hints.needPoints,
    )

    act(() => {
      get().addSectionPoint({ kind: 'edge', edgeIndex: 0, t: 0.5 })
      get().addSectionPoint({ kind: 'edge', edgeIndex: 4, t: 0.25 })
      get().addSectionPoint({ kind: 'edge', edgeIndex: 9, t: 0.5 })
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      strings.section.hints.ready,
    )
    expect(screen.getByText(/Точка 1/)).toBeInTheDocument()

    fireEvent.click(
      screen.getByLabelText(`${strings.section.removePoint} 1`),
    )
    expect(get().section.points).toHaveLength(2)

    fireEvent.click(screen.getByText(strings.section.clear))
    expect(get().section.points).toEqual([])
  })

  it('updates every section appearance control', () => {
    render(<ControlPanel />)
    fireEvent.change(
      screen.getByLabelText(strings.section.appearance.color),
      { target: { value: '#112233' } },
    )
    fireEvent.change(
      screen.getByLabelText(strings.section.appearance.opacity),
      { target: { value: '0.6' } },
    )
    fireEvent.change(
      screen.getByLabelText(strings.section.appearance.outlineColor),
      { target: { value: '#445566' } },
    )
    fireEvent.change(
      screen.getByLabelText(strings.section.appearance.outlineWidth),
      { target: { value: '5' } },
    )

    expect(get().section.appearance).toEqual({
      color: '#112233',
      opacity: 0.6,
      outlineColor: '#445566',
      outlineWidth: 5,
    })
  })

  it('shows approximate and unsupported section guidance', () => {
    render(<ControlPanel />)
    fireEvent.change(screen.getByLabelText(strings.panel.shape), {
      target: { value: 'cylinder' },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      strings.section.hints.approximate,
    )

    fireEvent.change(screen.getByLabelText(strings.panel.shape), {
      target: { value: 'sphere' },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      strings.section.hints.unsupported,
    )
  })
})
