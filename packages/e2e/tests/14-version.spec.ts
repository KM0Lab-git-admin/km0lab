/**
 * Versión y compatibilidad (docs/VERSIONES.md).
 * La app dice su versión al servidor y, si este la rechaza por antigua,
 * enseña «actualiza» en vez de fallar sin explicación. No escribe nada.
 */
import { apiURL, realPostalCode } from '../support/env'
import { expect, test } from '../support/fixtures'

test.describe('Versión de la app @lectura', () => {
  test('cada petición al servidor lleva la versión de la app', async ({
    app,
    page,
  }) => {
    const sent = page.waitForRequest(
      (request) =>
        request.url().startsWith(`${apiURL}/api/v1/towns/public`) &&
        request.method() === 'GET'
    )
    await app.open('/')
    await app.chooseLanguage()
    await app.skipOnboarding()
    await app.typePostalCode(realPostalCode)

    const headers = (await sent).headers()
    expect(headers['x-app-version']).toMatch(/^\d+\.\d+\.\d+$/)
    expect(headers['x-app-platform']).toBe('web')
  })

  test('si el servidor ya no admite esta versión, la app pide actualizar', async ({
    app,
    page,
  }) => {
    await page.route(`${apiURL}/api/v1/towns/public**`, (route) => {
      if (route.request().method() === 'OPTIONS') return route.continue()
      return route.fulfill({
        status: 426,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          detail: {
            code: 'app_update_required',
            min_version: '99.0.0',
            your_version: '1.0.1',
          },
        }),
      })
    })

    await app.open('/')
    await app.chooseLanguage()
    await app.skipOnboarding()
    await app.typePostalCode(realPostalCode)

    const notice = page.getByRole('alertdialog')
    await expect(notice).toBeVisible()
    await expect(notice).toContainText(app.tr('update.title'))
    await expect(
      notice.getByRole('button', { name: app.tr('update.cta_web') })
    ).toBeVisible()
  })
})
