/**
 * Recorrido 3 · Alta de un vecino nuevo.
 * Un correo que no existía entra, queda dado de alta y recibe sus puntos
 * de bienvenida. Escribe solo en el territorio de pruebas.
 */
import { me, qaLogin } from '../support/api'
import { qaPostalCode, qaTownName } from '../support/env'
import { expect, test } from '../support/fixtures'

test.describe('Alta de un vecino nuevo @qa', () => {
  test('se registra, recibe la bienvenida y el saldo cuadra', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('alta')

    await app.start(qaPostalCode, qaTownName)
    await app.login(email, { expectWelcome: true })

    // Lo que el servidor abonó es lo que anuncia el aviso.
    const session = await qaLogin(email)
    const balance = (await me(session.access_token)).points
    expect(balance).toBeGreaterThan(0)
    await expect(app.dialog()).toContainText(String(balance))
    await app.closeWelcome()

    await test.step('el saldo es el mismo en todas las pantallas', async () => {
      await app.expectHomeBalance(balance)
      await app.expectHistoryBalance(balance)
      await app.expectCatalogBalance(balance)
    })

    await test.step('volver a entrar no repite el aviso ni los puntos', async () => {
      await app.open('/profile')
      await app.button('profile.logout').click()
      await expect(app.toast('profile.toast_logout')).toBeVisible()

      await app.open('/home')
      await app.login(email, { expectWelcome: false })
      expect((await me(session.access_token)).points).toBe(balance)
    })
  })
})
