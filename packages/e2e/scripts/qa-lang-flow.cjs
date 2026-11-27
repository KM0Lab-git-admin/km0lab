/**
 * Smoke QA: Language → Onboarding respeta el idioma del store.
 *
 * Arranca el dist de km0lab, elige ca/es/en en /language y comprueba
 * que /onboarding muestra skip/finish/título en ese idioma.
 *
 * Uso: node packages/e2e/scripts/qa-lang-flow.cjs
 * Env: VISUAL_FORCE_BUILD=1 para forzar rebuild.
 */
const { chromium } = require('@playwright/test')

const { buildAndServe } = require('./lib/build-and-serve.cjs')

const FORCE_BUILD = process.env.VISUAL_FORCE_BUILD === '1'
const PORT = Number(process.env.VISUAL_LOCAL_PORT ?? '4174')

const EXPECTED = {
  ca: {
    skip: 'SALTAR',
    finish: 'INICI',
    title: 'Connecta amb el teu barri',
  },
  es: {
    skip: 'SALTAR',
    finish: 'INICIO',
    title: 'Conecta con tu barrio',
  },
  en: {
    skip: 'SKIP',
    finish: 'START',
    title: 'Connect with your neighborhood',
  },
}

async function pickLanguage(page, lang) {
  // LanguageCard: botón con el nombre del idioma
  const label = lang === 'ca' ? 'Català' : lang === 'en' ? 'English' : 'Español'
  await page.getByRole('button', { name: new RegExp(label, 'i') }).click()
  await page.waitForURL(/\/onboarding/, { timeout: 8000 })
}

async function assertOnboarding(page, lang) {
  const exp = EXPECTED[lang]
  await page.waitForSelector('text=' + exp.title, { timeout: 8000 })
  const body = await page.locator('body').innerText()
  if (!body.includes(exp.skip)) {
    throw new Error(`[${lang}] faltan en onboarding: skip="${exp.skip}"`)
  }
  if (!body.includes(exp.title)) {
    throw new Error(`[${lang}] faltan en onboarding: title="${exp.title}"`)
  }

  // finishLabel sustituye a skip en el último slide
  const nextBtn = page.getByRole('button', { name: 'Next' })
  for (let i = 0; i < 8; i += 1) {
    const text = await page.locator('body').innerText()
    if (text.includes(exp.finish)) return
    if (await nextBtn.isDisabled()) break
    await nextBtn.click()
    await page.waitForTimeout(350)
  }
  const finalBody = await page.locator('body').innerText()
  if (!finalBody.includes(exp.finish)) {
    throw new Error(`[${lang}] faltan en onboarding: finish="${exp.finish}"`)
  }
}

async function runLang(browser, baseUrl, lang) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    locale: lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES',
  })
  const page = await context.newPage()
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
    await pickLanguage(page, lang)
    await assertOnboarding(page, lang)
    console.log(`  ✓ ${lang}: Language → Onboarding OK`)
  } finally {
    await page.close()
    await context.close()
  }
}

async function main() {
  const server = await buildAndServe({ port: PORT, forceBuild: FORCE_BUILD })
  const baseUrl = `http://127.0.0.1:${PORT}`
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    console.log(`QA idiomas en ${baseUrl}`)
    for (const lang of ['ca', 'es', 'en']) {
      try {
        await runLang(browser, baseUrl, lang)
        results.push({ lang, ok: true })
      } catch (err) {
        console.error(`  ✗ ${lang}: ${err.message}`)
        results.push({ lang, ok: false, error: err.message })
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }

  const failed = results.filter((r) => !r.ok)
  if (failed.length) {
    console.error(`\nQA idiomas FALLÓ: ${failed.length}/3`)
    process.exit(1)
  }
  console.log('\nQA idiomas OK: ca / es / en')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
