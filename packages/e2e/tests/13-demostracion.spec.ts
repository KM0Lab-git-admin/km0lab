/**
 * Demostración · El municipio de las presentaciones comerciales (00000).
 * Entra con la cuenta de demostración y mira. No canjea ni escanea: los
 * saldos de la demo son de quien presenta, no de las pruebas.
 */
import { demoPostalCode, demoResidentEmail, target } from '../support/env'
import { expect, test } from '../support/fixtures'

test.describe('Demostración @demo', () => {
  test.skip(target === 'production', 'En producción no hay demostración')

  test('la cuenta de demostración entra y ve su cuenta', async ({ app }) => {
    await app.start(demoPostalCode)
    await app.login(demoResidentEmail, { expectWelcome: false })

    await expect(
      app.page
        .getByRole('button', { name: new RegExp(app.tr('common.points')) })
        .first()
    ).toBeVisible()

    await app.tab('points')
    await expect(app.heading('points.history.title')).toBeVisible()
    await expect(app.text('account.error')).toHaveCount(0)

    await app.tab('rewards')
    await expect(app.heading('redemptions.title')).toBeVisible()
    await expect(app.text('account.error')).toHaveCount(0)

    await app.open('/rewards')
    await expect(app.heading('rewards.title')).toBeVisible()
    await expect(app.page.getByRole('article').first()).toBeVisible()
  })
})
