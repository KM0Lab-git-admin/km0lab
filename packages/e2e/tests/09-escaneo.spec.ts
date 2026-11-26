/**
 * Recorrido 9 · Escaneo.
 * Leer el QR de un comercio suma los puntos del municipio una sola vez.
 * La cámara no se puede automatizar: se prueba lo que hace al leer un QR,
 * que es abrir su enlace (`/scan?c=…`).
 */
import { me, qaLogin, townByPostalCode } from '../support/api'
import { qaPostalCode, qaTownName } from '../support/env'
import { expect, test } from '../support/fixtures'

// Sembrado en km0lab-api (app/services/qa_territory.py).
const SHOP = { qr: 'qa-shop-2', name: '[QA] Llibreria de proves' }

test.describe('Escaneo @qa', () => {
  test('suma los puntos una vez; repetir y un QR falso se explican', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('escaneo')
    const town = await townByPostalCode(qaPostalCode)
    await app.start(qaPostalCode, qaTownName)
    await app.login(email, { expectWelcome: true })
    await app.closeWelcome()
    const session = await qaLogin(email)
    const before = (await me(session.access_token)).points

    await test.step('primer escaneo: confirma comercio, puntos y saldo', async () => {
      await app.scan(SHOP.qr)
      await expect(app.heading('scanner.confirmation.title')).toBeVisible()
      await expect(app.page.getByText(SHOP.name)).toBeVisible()
      await expect(
        app.page.getByText(`+${town.default_visit_points}`)
      ).toBeVisible()

      const after = (await me(session.access_token)).points
      expect(after).toBe(before + town.default_visit_points)
      await expect(
        app.page.getByText(app.pointsLabel(after)).first()
      ).toBeVisible()
    })

    await test.step('segundo escaneo del mismo comercio: ya visitado, sin puntos', async () => {
      await app.scan(SHOP.qr)
      await expect(app.heading('scanner.error.ja_visitat.title')).toBeVisible()
      expect((await me(session.access_token)).points).toBe(
        before + town.default_visit_points
      )
    })

    await test.step('un QR que no es de KM0: código no válido', async () => {
      await app.scan('esto-no-es-un-qr-de-km0')
      await expect(
        app.heading('scanner.error.codi_no_valid.title')
      ).toBeVisible()
    })

    await test.step('el historial recoge un único escaneo', async () => {
      await app.expectHistoryBalance(before + town.default_visit_points)
    })
  })

  // La pegatina del comercio es la puerta de entrada: quien la escanea con
  // la cámara del móvil no tiene por qué haber abierto nunca la app.
  test('quien nunca ha usado la app suma la visita al registrarse', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('enlace-nuevo')
    const town = await townByPostalCode(qaPostalCode)

    await test.step('abre el enlace: idioma y código postal antes que nada', async () => {
      await app.scan(SHOP.qr)
      await app.chooseLanguage()
      await app.skipOnboarding()
      await app.typePostalCode(qaPostalCode)
      await app.button('common.continue').click()
    })

    await test.step('la app lo lleva a entrar y, al entrar, suma la visita', async () => {
      await app.loginFromLoginScreen(email)
      await expect(app.heading('scanner.confirmation.title')).toBeVisible()
      await expect(app.page.getByText(SHOP.name)).toBeVisible()
      await expect(
        app.page.getByText(`+${town.default_visit_points}`)
      ).toBeVisible()
    })

    await test.step('el saldo es la bienvenida más la visita, una sola vez', async () => {
      const session = await qaLogin(email)
      const balance = (await me(session.access_token)).points
      expect(balance).toBeGreaterThan(town.default_visit_points)
      await app.expectHistoryBalance(balance)
      // Volver a la portada no repite el escaneo.
      await app.open('/home')
      await app.expectHomeBalance(balance)
      expect((await me(session.access_token)).points).toBe(balance)
    })
  })

  test('con la app ya abierta pero sin sesión, entra y suma la visita', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('enlace-sin-sesion')
    const town = await townByPostalCode(qaPostalCode)
    await app.start(qaPostalCode, qaTownName)

    await app.scan(SHOP.qr)
    await app.loginFromLoginScreen(email)
    await expect(app.heading('scanner.confirmation.title')).toBeVisible()
    await expect(
      app.page.getByText(`+${town.default_visit_points}`)
    ).toBeVisible()
  })
})
