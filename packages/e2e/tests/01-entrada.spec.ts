/**
 * Recorrido 1 · Entrada.
 * Idioma, bienvenida y código postal: lo primero que ve cualquier vecino.
 * No escribe nada.
 */
import { townByPostalCode } from '../support/api'
import { App } from '../support/app'
import { realPostalCode } from '../support/env'
import { expect, test } from '../support/fixtures'
import { LANGS } from '../support/i18n'

test.describe('Entrada @lectura', () => {
  for (const lang of LANGS) {
    test(`elige ${lang} y llega a Home en ese idioma`, async ({ page }) => {
      const app = new App(page, lang)
      const town = await townByPostalCode(realPostalCode)

      await app.open('/')
      await app.chooseLanguage()
      await expect(app.button('onboarding.skip')).toBeVisible()
      await app.skipOnboarding()
      await app.enterPostalCode(realPostalCode, town.name)

      await app.expectHome(town.name)
      await expect(app.button('home.join.cta').first()).toBeVisible()
      await expect(app.heading('home.section.rewards')).toBeVisible()
    })
  }

  test('un código postal desconocido se explica y no deja pasar', async ({
    app,
  }) => {
    await app.open('/')
    await app.chooseLanguage()
    await app.skipOnboarding()
    await app.typePostalCode('01234')

    // La app lo comprueba al escribir y no deja continuar.
    await expect(app.text('postal.error_notfound')).toBeVisible()
    await expect(app.button('common.continue')).toBeDisabled()
    await expect(app.page).toHaveURL(/\/postal-code/)
  })

  test('sin conexión con el servidor lo dice, no lo confunde con «desconocido»', async ({
    app,
    page,
  }) => {
    await page.route('**/towns/public**', (route) => route.abort())
    await app.open('/')
    await app.chooseLanguage()
    await app.skipOnboarding()
    await app.typePostalCode(realPostalCode)

    await expect(app.text('postal.error_connection')).toBeVisible()
    await expect(app.text('postal.error_notfound')).toHaveCount(0)
    await expect(app.button('common.continue')).toBeDisabled()
    await expect(app.page).toHaveURL(/\/postal-code/)
  })

  test('sin idioma ni código postal no se entra a Home', async ({ page }) => {
    await page.goto('/home')
    await expect(page).not.toHaveURL(/\/home/)
  })
})
