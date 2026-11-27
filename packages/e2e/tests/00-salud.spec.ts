/**
 * Salud · ¿Está todo levantado y es la versión que toca?
 * No abre el navegador ni escribe nada. Es lo primero que se mira tras un
 * despliegue y lo que corre cada pocas horas.
 */
import { apiHealth, eventsHealth, townByPostalCode } from '../support/api'
import { baseURL, realPostalCode, target } from '../support/env'
import { expect, test } from '../support/fixtures'

test.describe('Salud @lectura', () => {
  test('la API de negocio responde', async () => {
    const health = await apiHealth()
    expect(health.status).toBe('healthy')
    // Lo que no puede pasar: probar «UAT» contra una API de producción, o
    // «producción» contra una que no lo es.
    if (target === 'production') {
      expect(health.environment).toBe('production')
    } else {
      expect(health.environment).not.toBe('production')
    }
    // UAT debería declararse `staging`. Si dice `development` funciona
    // igual, pero con los límites y el arranque de una máquina local: se
    // avisa en el informe sin dar la prueba por fallida.
    if (target === 'uat' && health.environment !== 'staging') {
      test.info().annotations.push({
        type: 'aviso',
        description: `La API de UAT se declara «${health.environment}», no «staging».`,
      })
    }

    // Tras un despliegue: comprueba que lo desplegado es lo que se subió.
    const expected = process.env.E2E_EXPECT_API_COMMIT
    if (expected) expect(health.commit ?? '').toContain(expected.slice(0, 7))
  })

  test('el servidor de agenda y noticias responde', async () => {
    expect(await eventsHealth()).toBe(200)
  })

  test('la app se sirve', async ({ request }) => {
    const res = await request.get(baseURL)
    expect(res.status()).toBe(200)
    expect(await res.text()).toContain('<div id="root"')
  })

  test('el municipio real existe y tiene reglas de puntos', async () => {
    const town = await townByPostalCode(realPostalCode)
    expect(town.name.length).toBeGreaterThan(0)
    expect(town.default_visit_points).toBeGreaterThan(0)
  })
})
