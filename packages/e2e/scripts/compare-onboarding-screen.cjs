const fs = require('node:fs/promises')
const path = require('node:path')

const { chromium } = require('@playwright/test')
const { PNG } = require('pngjs')

const { buildAndServe } = require('./lib/build-and-serve.cjs')

const REFERENCE_URL =
  process.env.REFERENCE_ONBOARDING_URL ??
  'https://char-con-todos.lovable.app/onboarding'
const PIXEL_THRESHOLD = Number(process.env.VISUAL_PIXEL_THRESHOLD ?? '0.15')
const FORCE_BUILD = process.env.VISUAL_FORCE_BUILD === '1'
const STATIC_PORT = Number(process.env.VISUAL_LOCAL_PORT ?? '4173')
const LOCAL_PATH = process.env.VISUAL_LOCAL_PATH ?? '/onboarding?lang=es'

const viewports = [
  { name: 'vertical-mobile-375x667', width: 375, height: 667 },
  { name: 'vertical-tablet-768x1024', width: 768, height: 1024 },
  { name: 'horizontal-mobile-667x375', width: 667, height: 375 },
  { name: 'horizontal-desktop-1280x550', width: 1280, height: 550 },
]

const outputRoot = path.resolve(__dirname, '../artifacts/onboarding-screen')

async function ensureCleanOutput() {
  await fs.rm(outputRoot, { recursive: true, force: true })
  await fs.mkdir(outputRoot, { recursive: true })
}

async function preparePage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  })
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready
    }
  })
  await page.waitForTimeout(150)
}

async function capture(browser, viewport, url, filePath) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  try {
    await preparePage(page, url)
    await page.screenshot({ path: filePath, fullPage: false })
  } finally {
    await page.close()
    await context.close()
  }
}

async function diffImages(referencePath, localPath, diffPath) {
  const [{ default: pixelmatch }, referenceBuffer, localBuffer] =
    await Promise.all([
      import('pixelmatch'),
      fs.readFile(referencePath),
      fs.readFile(localPath),
    ])

  const reference = PNG.sync.read(referenceBuffer)
  const local = PNG.sync.read(localBuffer)

  if (reference.width !== local.width || reference.height !== local.height) {
    throw new Error(
      `Screenshot sizes differ: reference ${reference.width}x${reference.height}, local ${local.width}x${local.height}`
    )
  }

  const diff = new PNG({ width: reference.width, height: reference.height })
  const mismatchPixels = pixelmatch(
    reference.data,
    local.data,
    diff.data,
    reference.width,
    reference.height,
    { threshold: PIXEL_THRESHOLD }
  )

  await fs.writeFile(diffPath, PNG.sync.write(diff))

  return {
    mismatchPixels,
    totalPixels: reference.width * reference.height,
    mismatchRatio: mismatchPixels / (reference.width * reference.height),
  }
}

async function main() {
  await ensureCleanOutput()

  const server = await buildAndServe({
    port: STATIC_PORT,
    forceBuild: FORCE_BUILD,
  })
  const localUrl = process.env.LOCAL_ONBOARDING_URL ?? `${server.url}${LOCAL_PATH}`

  const browser = await chromium.launch()
  const results = []

  try {
    for (const viewport of viewports) {
      const viewportDir = path.join(outputRoot, viewport.name)
      await fs.mkdir(viewportDir, { recursive: true })

      const referencePath = path.join(viewportDir, 'reference.png')
      const localPath = path.join(viewportDir, 'local.png')
      const diffPath = path.join(viewportDir, 'diff.png')

      await capture(browser, viewport, REFERENCE_URL, referencePath)
      await capture(browser, viewport, localUrl, localPath)

      const diff = await diffImages(referencePath, localPath, diffPath)
      results.push({ viewport: viewport.name, ...diff })
    }
  } finally {
    await browser.close()
    await server.close()
  }

  const report = {
    localUrl,
    referenceUrl: REFERENCE_URL,
    pixelThreshold: PIXEL_THRESHOLD,
    generatedAt: new Date().toISOString(),
    results,
  }

  await fs.writeFile(
    path.join(outputRoot, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  )

  console.table(
    results.map((result) => ({
      viewport: result.viewport,
      mismatch: `${(result.mismatchRatio * 100).toFixed(2)}%`,
      pixels: result.mismatchPixels,
    }))
  )
  console.log(`Artifacts written to ${outputRoot}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
