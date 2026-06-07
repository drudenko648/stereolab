import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import * as THREE from 'three'
import { strings } from '../src/ui/strings'
import { SHAPE_TYPES } from '../src/geometry/shapes'
import type { Vec3 } from '../src/geometry/types'

/** Fraction of canvas pixels that are non-transparent (i.e. something drawn). */
async function nonBlankRatio(page: import('@playwright/test').Page) {
  return await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement
    const off = document.createElement('canvas')
    off.width = c.width
    off.height = c.height
    const ctx = off.getContext('2d')!
    ctx.drawImage(c, 0, 0)
    const { data } = ctx.getImageData(0, 0, off.width, off.height)
    let drawn = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) drawn++
    return drawn / (off.width * off.height)
  })
}

async function canvasDataUrl(page: import('@playwright/test').Page) {
  return await page.evaluate(() =>
    (document.querySelector('canvas') as HTMLCanvasElement).toDataURL(),
  )
}

async function projectWorldPoint(
  page: import('@playwright/test').Page,
  point: Vec3,
  radius: number,
) {
  const box = await page.locator('canvas').boundingBox()
  if (!box) throw new Error('canvas bounds unavailable')

  const camera = new THREE.PerspectiveCamera(
    45,
    box.width / box.height,
    0.1,
    1000,
  )
  const distance =
    (radius / Math.sin(THREE.MathUtils.degToRad(45) / 2)) * 1.5
  camera.position.set(0.7 * distance, 0.6 * distance, 0.7 * distance)
  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld()

  const projected = new THREE.Vector3(...point).project(camera)
  return {
    x: box.x + ((projected.x + 1) * box.width) / 2,
    y: box.y + ((1 - projected.y) * box.height) / 2,
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('canvas')).toBeVisible()
  // Wait until the first frame (and troika label font) has rendered.
  await expect.poll(() => nonBlankRatio(page), { timeout: 15000 }).toBeGreaterThan(0.02)
})

test('renders the default cube', async ({ page }) => {
  expect(await nonBlankRatio(page)).toBeGreaterThan(0.02)
})

test('does not export on initial load', async ({ page }) => {
  let downloads = 0
  page.on('download', () => {
    downloads++
  })
  await page.waitForTimeout(1000)
  expect(downloads).toBe(0)
})

test('renders every Stage 2 shape distinctly', async ({ page }) => {
  const seen = new Set<string>()
  for (const type of SHAPE_TYPES) {
    await page.getByLabel(strings.panel.shape).selectOption(type)
    await page.waitForTimeout(400)
    expect(await nonBlankRatio(page)).toBeGreaterThan(0.02)
    seen.add(await canvasDataUrl(page))
  }
  // Each shape produced a different image.
  expect(seen.size).toBe(SHAPE_TYPES.length)
})

test('keeps base vertices after switching from a curved solid', async ({
  page,
}) => {
  // Regression: switching cylinder → a polygon-base shape used to drop the
  // first two base vertices (A, B). The image reached via the cylinder must
  // match a directly-rendered prism.
  await page.getByLabel(strings.panel.shape).selectOption('prism')
  await page.waitForTimeout(400)
  const directPrism = await canvasDataUrl(page)

  await page.getByLabel(strings.panel.shape).selectOption('cylinder')
  await page.waitForTimeout(400)
  await page.getByLabel(strings.panel.shape).selectOption('prism')
  await page.waitForTimeout(400)
  const viaCylinder = await canvasDataUrl(page)

  expect(viaCylinder).toBe(directPrism)
})

test('zoom buttons change the framing', async ({ page }) => {
  const before = await canvasDataUrl(page)
  await page.getByRole('button', { name: strings.camera.zoomIn }).click()
  await page.waitForTimeout(300)
  const zoomedIn = await canvasDataUrl(page)
  expect(zoomedIn).not.toBe(before)

  await page.getByRole('button', { name: strings.camera.zoomOut }).click()
  await page.waitForTimeout(300)
  expect(await canvasDataUrl(page)).not.toBe(zoomedIn)
})

test('captures visual snapshots of every new solid', async ({ page }) => {
  const newShapes = [
    'cylinder',
    'cone',
    'sphere',
    'truncatedPyramid',
    'truncatedCone',
  ] as const

  for (const type of newShapes) {
    await page.getByLabel(strings.panel.shape).selectOption(type)
    await page.waitForTimeout(400)
    await expect(page.locator('canvas')).toHaveScreenshot(`${type}.png`, {
      animations: 'disabled',
    })
  }
})

test('appearance controls visibly change the solid', async ({ page }) => {
  const figureColor = page.getByLabel(strings.appearance.figureColor)
  const opacity = page.getByLabel(strings.appearance.faceOpacity)
  const edgeColor = page.getByLabel(strings.appearance.edgeColor)
  const edgeWidth = page.getByLabel(strings.appearance.edgeWidth)
  const edgeStyle = page.getByLabel(strings.appearance.edgeStyle)
  const vertexColor = page.getByLabel(strings.appearance.vertexColor)
  const vertexSize = page.getByLabel(strings.appearance.vertexSize)

  let before = await canvasDataUrl(page)
  await figureColor.fill('#d7263d')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  before = await canvasDataUrl(page)
  await opacity.fill('0.3')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  before = await canvasDataUrl(page)
  await edgeColor.fill('#f59e0b')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  before = await canvasDataUrl(page)
  await edgeWidth.fill('7')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  before = await canvasDataUrl(page)
  await edgeStyle.selectOption('dashed')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  before = await canvasDataUrl(page)
  await vertexColor.fill('#16a34a')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  before = await canvasDataUrl(page)
  await vertexSize.fill('0.18')
  await page.waitForTimeout(200)
  expect(await canvasDataUrl(page)).not.toBe(before)

  await expect(page.locator('canvas')).toHaveScreenshot('styled-cube.png', {
    animations: 'disabled',
  })
})

test('renames a vertex and includes the updated label in export', async ({
  page,
}) => {
  const firstDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: strings.export.download }).click()
  const beforePath = await (await firstDownload).path()
  const before = readFileSync(beforePath)

  await page.getByLabel(strings.rename.name).fill('P')
  await page.getByRole('button', { name: strings.rename.apply }).click()
  await expect(page.getByLabel(strings.rename.vertex)).toContainText('P')
  await page.waitForTimeout(300)

  const secondDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: strings.export.download }).click()
  const afterPath = await (await secondDownload).path()
  const after = readFileSync(afterPath)

  expect(after.equals(before)).toBe(false)
})

test('exports styled PNGs on transparent, white and dark backgrounds', async ({
  page,
}) => {
  await page.getByLabel(strings.panel.shape).selectOption('truncatedCone')
  await page.getByLabel(strings.appearance.figureColor).fill('#d7263d')
  await page.getByLabel(strings.appearance.edgeColor).fill('#f59e0b')
  await page.getByLabel(strings.appearance.edgeWidth).fill('6')
  await page.getByLabel(strings.appearance.edgeStyle).selectOption('dashed')

  await page.evaluate(() => {
    const captures: string[] = []
    Object.defineProperty(window, '__stereolabCaptures', {
      configurable: true,
      value: captures,
    })
    HTMLAnchorElement.prototype.click = function captureExport() {
      captures.push(this.href)
    }
  })

  const expectedCorners = {
    transparent: [0, 0, 0, 0],
    white: [255, 255, 255, 255],
    dark: [21, 23, 28, 255],
  } as const

  for (const [index, background] of (
    ['transparent', 'white', 'dark'] as const
  ).entries()) {
    await page.getByLabel(strings.export.background).selectOption(background)
    await page.getByRole('button', { name: strings.export.download }).click()
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as unknown as Window & {
                __stereolabCaptures: string[]
              }
            ).__stereolabCaptures.length,
        ),
      )
      .toBe(index + 1)

    const corner = await page.evaluate(async () => {
      const captures = (
        window as unknown as Window & {
          __stereolabCaptures: string[]
        }
      ).__stereolabCaptures
      const image = new Image()
      image.src = captures.at(-1) ?? ''
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      return Array.from(context.getImageData(0, 0, 1, 1).data)
    })
    expect(corner).toEqual(expectedCorners[background])
  }
})

test('display toggles change what is drawn', async ({ page }) => {
  const before = await canvasDataUrl(page)
  await page.getByLabel(strings.display.faces).uncheck()
  await page.waitForTimeout(300)
  expect(await canvasDataUrl(page)).not.toBe(before)

  // With everything off, the canvas should be (almost) empty.
  await page.getByLabel(strings.display.edges).uncheck()
  await page.getByLabel(strings.display.vertices).uncheck()
  await page.getByLabel(strings.display.labels).uncheck()
  await page.waitForTimeout(300)
  expect(await nonBlankRatio(page)).toBeLessThan(0.005)
})

test('quick views reorient the camera', async ({ page }) => {
  await page.getByRole('button', { name: strings.camera.front }).click()
  await page.waitForTimeout(300)
  const front = await canvasDataUrl(page)

  await page.getByRole('button', { name: strings.camera.top }).click()
  await page.waitForTimeout(300)
  expect(await canvasDataUrl(page)).not.toBe(front)
})

test('lock toggles the camera control state', async ({ page }) => {
  const lock = page.getByRole('button', { name: strings.camera.lock })
  await lock.click()
  await expect(
    page.getByRole('button', { name: strings.camera.unlock }),
  ).toBeVisible()
})

test('exports a high-resolution PNG', async ({ page }) => {
  // Default resolution is 2×; capture the logical canvas size to predict output.
  const logical = await page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement
    return { w: c.clientWidth, h: c.clientHeight }
  })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: strings.export.download }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('stereolab-cube.png')

  const path = await download.path()
  const buf = readFileSync(path)
  // PNG signature.
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  // IHDR width/height are big-endian uint32 at byte offsets 16 and 20.
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  expect(Math.abs(width - logical.w * 2)).toBeLessThanOrEqual(2)
  expect(Math.abs(height - logical.h * 2)).toBeLessThanOrEqual(2)
})

test('builds, drags, and exports an interactive cube section', async ({
  page,
}) => {
  await page.getByRole('button', { name: strings.section.enable }).click()
  await expect(page.getByRole('alert')).toContainText(
    strings.section.hints.needPoints,
  )

  const edgePoints: Vec3[] = [
    [0, -1, 1],
    [0, 1, 1],
    [-1, 0, 1],
  ]
  for (const point of edgePoints) {
    const screenPoint = await projectWorldPoint(page, point, Math.sqrt(3))
    await page.mouse.click(screenPoint.x, screenPoint.y)
  }

  await expect(page.getByRole('status')).toContainText(
    strings.section.hints.ready,
  )
  await expect(page.getByText(/Точка 1/)).toBeVisible()
  await page.waitForTimeout(300)
  const beforeDrag = await canvasDataUrl(page)
  await expect(page.locator('canvas')).toHaveScreenshot('cube-section.png', {
    animations: 'disabled',
  })

  const dragStart = await projectWorldPoint(page, edgePoints[0], Math.sqrt(3))
  const dragEnd = await projectWorldPoint(
    page,
    [0.65, -1, 1],
    Math.sqrt(3),
  )
  await page.mouse.move(dragStart.x, dragStart.y)
  await page.mouse.down()
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(300)
  expect(await canvasDataUrl(page)).not.toBe(beforeDrag)
  await expect(page.getByRole('status')).toContainText(
    strings.section.hints.ready,
  )

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: strings.export.download }).click()
  const path = await (await downloadPromise).path()
  const buffer = readFileSync(path)
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
})

test('rotates without adding a point in section mode', async ({ page }) => {
  await page.getByRole('button', { name: strings.section.enable }).click()
  const beforeRotate = await canvasDataUrl(page)
  const canvasBox = await page.locator('canvas').boundingBox()
  if (!canvasBox) throw new Error('canvas bounds unavailable')
  const rotateStart = {
    x: canvasBox.x + canvasBox.width / 2,
    y: canvasBox.y + canvasBox.height / 2,
  }

  await page.mouse.move(rotateStart.x, rotateStart.y)
  await page.mouse.down()
  await page.mouse.move(rotateStart.x + 90, rotateStart.y + 35, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(300)

  expect(await canvasDataUrl(page)).not.toBe(beforeRotate)
  await expect(page.getByText(/Точка 1/)).toHaveCount(0)
})

test('shows curved approximation and sphere limitation', async ({ page }) => {
  await page.getByLabel(strings.panel.shape).selectOption('cylinder')
  await expect(page.getByRole('alert')).toContainText(
    strings.section.hints.approximate,
  )

  await page.getByLabel(strings.panel.shape).selectOption('sphere')
  await expect(page.getByRole('alert')).toContainText(
    strings.section.hints.unsupported,
  )
})

test('builds sections on a pyramid, prism, and cylinder', async ({ page }) => {
  await page.getByRole('button', { name: strings.section.enable }).click()

  const prismRadius = 2.5 / Math.sqrt(3)
  const cases: {
    type: 'pyramid' | 'prism' | 'cylinder'
    radius: number
    points: Vec3[]
  }[] = [
    {
      type: 'pyramid',
      radius: Math.hypot(1.25, 1.5, 1.25),
      points: [
        [0, -1.5, 1.25],
        [-0.625, 0, 0.625],
        [0.625, 0, 0.625],
      ],
    },
    {
      type: 'prism',
      radius: Math.hypot(prismRadius, 1.5),
      points: [
        [0, 1.5, 0.7],
        [-0.6, 1.5, -0.3],
        [0.6, 1.5, -0.3],
      ],
    },
    {
      type: 'cylinder',
      radius: Math.hypot(1.5, 1.5),
      points: [
        [0, 1.5, 0],
        [0.7, 1.5, 0],
        [0, 1.5, 0.7],
      ],
    },
  ]

  for (const sectionCase of cases) {
    await page.getByLabel(strings.panel.shape).selectOption(sectionCase.type)
    await page.waitForTimeout(250)
    for (const point of sectionCase.points) {
      const screenPoint = await projectWorldPoint(
        page,
        point,
        sectionCase.radius,
      )
      await page.mouse.click(screenPoint.x, screenPoint.y)
    }
    await expect(page.getByRole('status')).toContainText(
      strings.section.hints.ready,
    )
    if (sectionCase.type === 'cylinder') {
      await expect(page.getByRole('status')).toContainText(
        strings.section.hints.approximate,
      )
    }
    await page.getByRole('button', { name: strings.section.clear }).click()
  }
})
