import { describe, expect, it } from 'vitest'
import {
  EXPORT_BACKGROUNDS,
  EXPORT_SCALES,
  backgroundSettings,
  exportFilename,
  scaledSize,
} from '../../src/export/export'

describe('export helpers', () => {
  it('maps backgrounds to scene/clear settings', () => {
    expect(backgroundSettings('transparent')).toEqual({ color: null, alpha: 0 })
    expect(backgroundSettings('white')).toEqual({ color: '#ffffff', alpha: 1 })
    expect(backgroundSettings('dark')).toEqual({ color: '#15171c', alpha: 1 })
  })

  it('scales render sizes to whole pixels', () => {
    expect(scaledSize({ width: 800, height: 600 }, 1)).toEqual({
      width: 800,
      height: 600,
    })
    expect(scaledSize({ width: 800, height: 600 }, 2)).toEqual({
      width: 1600,
      height: 1200,
    })
    expect(scaledSize({ width: 801, height: 601 }, 2)).toEqual({
      width: 1602,
      height: 1202,
    })
  })

  it('builds deterministic filenames', () => {
    expect(exportFilename('cube')).toBe('stereolab-cube.png')
    expect(exportFilename('pyramid', 'jpg')).toBe('stereolab-pyramid.jpg')
  })

  it('exposes the available options', () => {
    expect(EXPORT_BACKGROUNDS).toEqual(['transparent', 'white', 'dark'])
    expect(EXPORT_SCALES).toEqual([1, 2, 4])
  })
})
