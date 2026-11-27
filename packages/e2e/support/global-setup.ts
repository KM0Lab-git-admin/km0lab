/**
 * Antes de la primera prueba: ¿hay algo contra lo que probar?
 *
 * Falla pronto y con un mensaje claro si la API no responde o el
 * territorio de pruebas no está sembrado, en vez de dejar doce pruebas
 * rojas que dicen todas lo mismo.
 */
import {
  ApiFailure,
  apiHealth,
  prepareQaTerritory,
  townByPostalCode,
} from './api'
import {
  apiURL,
  baseURL,
  canWrite,
  qaPostalCode,
  qaToken,
  readOnly,
  runId,
  target,
} from './env'

const say = (line: string) => process.stdout.write(line + '\n')

export default async function globalSetup() {
  say(
    `\nRecorridos KM0 LAB · destino: ${target} · ejecución: ${runId}\n` +
      `  app: ${baseURL}\n  api: ${apiURL}`
  )

  let health
  try {
    health = await apiHealth()
  } catch (e) {
    throw new Error(
      `La API no responde en ${apiURL}. ¿Está arrancada? (${String(e)})`
    )
  }
  say(
    `  api: ${health.status} · entorno ${health.environment ?? '?'} · ` +
      `commit ${health.commit ?? 'local'}`
  )

  if (readOnly) {
    say(
      canWrite
        ? '  solo pruebas de lectura (@lectura)\n'
        : '  producción: solo pruebas de lectura (@lectura)\n'
    )
    return
  }
  if (health.environment === 'production') {
    throw new Error(
      `E2E_TARGET=${target} pero la API de ${apiURL} dice ser producción. ` +
        'No se ejecutan pruebas que escriben.'
    )
  }

  if (qaToken) {
    const out = await prepareQaTerritory()
    say(`  territorio de pruebas preparado: ${JSON.stringify(out)}`)
  }

  try {
    const town = await townByPostalCode(qaPostalCode)
    say(`  territorio de pruebas: ${town.name} (${qaPostalCode})\n`)
  } catch (e) {
    const missing = e instanceof ApiFailure && e.status === 404
    throw new Error(
      missing
        ? `El territorio de pruebas (${qaPostalCode}) no existe en ${apiURL}. ` +
            'En local: `python -m scripts.seed_qa` en km0lab-api. ' +
            'En UAT: define E2E_QA_TOKEN para que se siembre solo.'
        : `No se pudo comprobar el territorio de pruebas: ${String(e)}`
    )
  }
}
