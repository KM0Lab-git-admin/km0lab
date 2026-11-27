import { defineConfig, devices } from '@playwright/test'

import { baseURL, readOnly } from './support/env'

const isCI = !!process.env.CI

/**
 * Recorridos de vecino. Las mismas pruebas corren contra local, UAT o
 * producción: lo decide `E2E_TARGET` (ver `support/env.ts` y `README.md`).
 *
 * Etiquetas:
 *   @lectura  no escribe nada; vale para cualquier entorno.
 *   @qa       escribe, pero solo en el territorio de pruebas (CP 99999).
 *   @demo     entra con la cuenta de demostración y mira; no escribe.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  globalSetup: './support/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 3 : undefined,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // En producción, o si se pide, solo lo que no escribe.
  grep: readOnly ? /@lectura/ : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'movil',
      use: { ...devices['Pixel 7'] },
    },
  ],
})
