import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ControlPanel } from '../../src/ui/ControlPanel'
import { useStore } from '../../src/state/useStore'
import { strings } from '../../src/ui/strings'

const get = () => useStore.getState()

describe('ControlPanel', () => {
  it('renders all Stage 1 sections', () => {
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
