/**
 * Recorridos 4 y 5 · Acceso y cuenta.
 * Con la cuenta fija del territorio de pruebas. Solo lee: entra, mira y
 * sale. Su saldo no cambia entre ejecuciones.
 */
import { me, qaLogin } from '../support/api'
import { qaPostalCode, qaTownName } from '../support/env'
import { expect, test } from '../support/fixtures'

const RESIDENT = 'qa+vecino@km0lab.com'

test.describe('Acceso y cuenta @qa', () => {
  test('código equivocado, código correcto y cerrar sesión', async ({
    app,
  }) => {
    await app.start(qaPostalCode, qaTownName)
    await app.requestCode(RESIDENT)

    await test.step('un código equivocado se rechaza', async () => {
      await app.typeCode('000000')
      await expect(app.toast('otp.toast_wrong')).toBeVisible()
      await expect(app.page).toHaveURL(/\/check-email/)
    })

    await test.step('el código correcto entra, sin aviso de bienvenida', async () => {
      await app.typeCode('123456')
      await app.page.waitForURL(/\/home/)
      await expect(app.heading('home.section.quick')).toBeVisible()
      await expect(app.page.getByRole('dialog')).toHaveCount(0)
    })

    await test.step('las zonas privadas se abren', async () => {
      await app.tab('points')
      await expect(app.heading('points.history.title')).toBeVisible()
      await app.tab('actions')
      await expect(app.heading('points.actions.title')).toBeVisible()
      await app.tab('rewards')
      await expect(app.heading('redemptions.title')).toBeVisible()
    })

    await test.step('cerrar sesión cierra las zonas privadas', async () => {
      await app.tab('profile')
      await expect(app.heading('profile.title')).toBeVisible()
      await app.button('profile.logout').click()
      await expect(app.toast('profile.toast_logout')).toBeVisible()

      await app.open('/points-history')
      await expect(app.page).toHaveURL(/\/login/)
      await app.open('/profile')
      await expect(app.page).toHaveURL(/\/login/)
    })
  })

  test('el saldo es el del servidor en todas las pantallas', async ({
    app,
  }) => {
    const session = await qaLogin(RESIDENT)
    const balance = (await me(session.access_token)).points

    await app.start(qaPostalCode, qaTownName)
    await app.login(RESIDENT, { expectWelcome: false })

    await app.expectHomeBalance(balance)
    await app.expectHistoryBalance(balance)
    await app.expectCatalogBalance(balance)

    await app.open('/points-history')
    await expect(app.text('account.error')).toHaveCount(0)
    await app.open('/redeemed-rewards')
    await expect(app.heading('redemptions.title')).toBeVisible()
    await expect(app.text('account.error')).toHaveCount(0)
  })
})
