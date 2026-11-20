/**
 * Dónde corren los recorridos. Todo llega por variables de entorno para
 * que las mismas pruebas sirvan en local, en UAT y en producción.
 *
 *   E2E_TARGET            local (por defecto) | uat | production
 *   E2E_BASE_URL          dirección de la app
 *   E2E_API_URL           dirección de km0lab-api
 *   E2E_EVENTS_URL        dirección de events-query
 *   E2E_QA_TOKEN          clave de POST /qa/prepare (opcional)
 *   E2E_SCOPE             `lectura` = solo las pruebas que no escriben
 *   E2E_REAL_POSTAL_CODE  municipio real que se mira sin escribir (08380)
 *   E2E_RUN_ID            identificador de la ejecución (se genera solo)
 */
export type Target = 'local' | 'uat' | 'production'

const DEFAULTS: Record<Target, { app: string; api: string; events: string }> = {
  local: {
    app: 'http://localhost:5173',
    api: 'http://localhost:8000',
    events: 'http://127.0.0.1:8011',
  },
  uat: {
    app: 'https://app.uat.km0lab.com',
    api: 'https://api.uat.km0lab.com',
    events: 'https://eventquery.uat.km0lab.com',
  },
  production: {
    app: 'https://app.km0lab.com',
    api: 'https://api.km0lab.com',
    events: 'https://eventquery.km0lab.com',
  },
}

const rawTarget = (process.env.E2E_TARGET ?? 'local').toLowerCase()
if (!['local', 'uat', 'production'].includes(rawTarget)) {
  throw new Error(`E2E_TARGET desconocido: ${rawTarget}`)
}

export const target = rawTarget as Target

const trim = (url: string) => url.replace(/\/+$/, '')

export const baseURL = trim(process.env.E2E_BASE_URL ?? DEFAULTS[target].app)
export const apiURL = trim(process.env.E2E_API_URL ?? DEFAULTS[target].api)
export const eventsURL = trim(
  process.env.E2E_EVENTS_URL ?? DEFAULTS[target].events
)
export const qaToken = process.env.E2E_QA_TOKEN ?? ''

/** Municipio real: solo se lee, sin sesión. */
export const realPostalCode = process.env.E2E_REAL_POSTAL_CODE ?? '08380'

/** Territorio de pruebas (km0lab-api, app/qa.py). Aquí sí se escribe. */
export const qaPostalCode = '99999'
export const qaTownName = '[QA] QA KM0'

/** Municipio de demostración: se entra y se mira, no se escribe. */
export const demoPostalCode = '00000'
export const demoResidentEmail = 'resident@km0lab.com'

/** Código fijo de las cuentas de prueba. No existe en producción. */
export const fixedCode = '123456'

/**
 * En producción no hay territorio de pruebas ni código fijo: solo corren
 * las pruebas de lectura (@lectura).
 */
export const canWrite = target !== 'production'

/**
 * Solo lectura: en producción siempre; en el resto, si se pide con
 * `E2E_SCOPE=lectura` o filtrando por la etiqueta (`--grep @lectura`).
 */
export const readOnly =
  !canWrite ||
  (process.env.E2E_SCOPE ?? '').toLowerCase() === 'lectura' ||
  process.argv.some((arg) => arg.includes('@lectura'))

const stamp = () =>
  new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(2, 14)

/**
 * Identifica esta ejecución. Va dentro de cada cuenta que se crea
 * (`qa+r<id>-<nombre>@km0lab.com`) para que dos ejecuciones a la vez no
 * se pisen y para poder ver de dónde salió un dato.
 */
export const runId = (
  process.env.E2E_RUN_ID ?? `${stamp()}${Math.floor(Math.random() * 90 + 10)}`
)
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '')
  .slice(0, 24)

if (!process.env.E2E_RUN_ID) process.env.E2E_RUN_ID = runId
