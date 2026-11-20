/**
 * Prepara el territorio de pruebas de UAT (o enseña qué haría).
 *
 *   node packages/e2e/scripts/qa-prepare.cjs            # SOLO ENSEÑA
 *   node packages/e2e/scripts/qa-prepare.cjs --apply    # borra y siembra
 *
 * Llama a POST /api/v1/qa/prepare de km0lab-api. La clave sale de
 * E2E_QA_TOKEN o de packages/e2e/.qa-token (ignorado por git). Nunca se
 * imprime. Solo toca datos del territorio de pruebas (CP 99999, cuentas
 * qa+…@km0lab.com): ver km0lab-api/docs/QA-TERRITORY.md.
 */
const fs = require('node:fs')
const path = require('node:path')

const apiURL = (
  process.env.E2E_API_URL || 'https://api.uat.km0lab.com'
).replace(/\/+$/, '')
const apply = process.argv.includes('--apply')

const tokenFile = path.join(__dirname, '..', '.qa-token')
const token =
  process.env.E2E_QA_TOKEN ||
  (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '')

async function main() {
  if (!token) {
    console.error(
      'Falta la clave: define E2E_QA_TOKEN o crea packages/e2e/.qa-token'
    )
    process.exit(2)
  }
  const health = await fetch(`${apiURL}/api/v1/health`).then((r) => r.json())
  console.warn(
    `API: ${apiURL} · entorno ${health.environment ?? '?'} · commit ${health.commit ?? '?'}`
  )
  if (health.environment === 'production') {
    console.error('La API dice ser producción. No se hace nada.')
    process.exit(2)
  }

  const url = new URL(`${apiURL}/api/v1/qa/prepare`)
  url.searchParams.set('older_than_minutes', '120')
  if (!apply) url.searchParams.set('dry_run', 'true')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'X-QA-Token': token },
  })
  const body = await res.text()
  if (res.status === 404) {
    console.error(
      'La puerta está cerrada (404): la API desplegada no tiene QA_TOKEN o es una versión anterior.'
    )
    process.exit(1)
  }
  if (res.status === 401) {
    console.error('La clave no coincide con la de la API (401).')
    process.exit(1)
  }
  if (!res.ok) {
    console.error(`La API respondió ${res.status}: ${body.slice(0, 400)}`)
    process.exit(1)
  }
  const out = JSON.parse(body)
  console.warn(
    apply ? 'HECHO. Borrado:' : 'SOLO ENSEÑA (no ha cambiado nada). Borraría:'
  )
  console.warn(JSON.stringify(out.purge.counts, null, 2))
  if (apply) {
    console.warn('Sembrado:')
    console.warn(JSON.stringify(out.fixture, null, 2))
  } else {
    console.warn(
      'Y después dejaría sembrado el municipio 99999 con su catálogo y sus tres cuentas.'
    )
  }
}

main().catch((e) => {
  console.error(String(e))
  process.exit(1)
})
