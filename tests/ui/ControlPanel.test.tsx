import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('alert')).toHaveTextContent(
      strings.rename.errors.duplicate,
    )

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
})
