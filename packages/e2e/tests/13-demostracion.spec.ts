/**
 * Demostración · El municipio de las presentaciones comerciales (00000).
 * Entra con la cuenta de demostración y mira. No canjea ni escanea: los
 * saldos de la demo son de quien presenta, no de las pruebas.
 */
import { demoPostalCode, demoResidentEmail, target } from '../support/env'
import { expect, test } from '../support/fixtures'

test.describe('Demostración @demo', () => {
  test.skip(target === 'production', 'En producción no hay demostración')

  test('el 00000 abre la lista de poblaciones y se entra en la demostración', async ({
    app,
  }) => {
    await app.open('/')
    await app.chooseLanguage()
    await app.skipOnboarding()
    // Un código postal de verdad sigue como siempre: nada de lista.
    await expect(app.showcaseList()).toHaveCount(0)

    await app.typePostalCode(demoPostalCode)

    // La lista sale del servidor y no deja entrar sin elegir.
    const options = app.showcaseList().getByRole('radio')
    await expect(options.first()).toBeVisible()
    await expect(app.button('demo.enter')).toBeDisabled()

    await options.first().click()
    await expect(options.first()).toBeChecked()
    await app.button('demo.enter').click()

    await app.page.waitForURL(/\/home/)
    await app.expectHome()
    await expect(app.text('demo.badge').first()).toBeVisible()
  })

  test('el pueblo elegido cambia lo que se ve; los comercios son los de la demo', async ({
    app,
  }) => {
    // Lo que la app pide mientras tanto: de qué pueblo es el contenido y
    // de qué municipio son los comercios.
    const asked: string[] = []
    app.page.on('request', (request) => {
      asked.push(decodeURIComponent(request.url()))
    })

    await app.open('/')
    await app.chooseLanguage()
    await app.skipOnboarding()
    await app.typePostalCode(demoPostalCode)
    // Una agrupación enseña debajo las poblaciones que la forman.
    const group = app
      .showcaseList()
      .getByRole('radio')
      .filter({ hasText: 'Breda' })
    await expect(group).toContainText('Hostalric')
    await group.click()
    await app.button('demo.enter').click()
    await app.page.waitForURL(/\/home/)

    // El nombre es el de la población elegida, no «Demo KM0».
    await app.expectHome('Breda')
    await expect(app.text('demo.badge').first()).toBeVisible()
    // Agenda y noticias: las de Breda. Nada de Malgrat.
    await expect
      .poll(() => asked.some((url) => /(poblacion|city)=Breda/.test(url)))
      .toBe(true)
    expect(asked.some((url) => /(poblacion|city)=Malgrat/.test(url))).toBe(
      false
    )
    // Comercios y premios: los de Demo KM0, nunca los del pueblo real.
    await expect
      .poll(() =>
        asked.some((url) => url.includes(`postal_code=${demoPostalCode}`))
      )
      .toBe(true)
    expect(asked.some((url) => url.includes('postal_code=17400'))).toBe(false)
  })

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
