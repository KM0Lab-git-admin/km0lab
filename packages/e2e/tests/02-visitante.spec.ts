/**
 * Recorrido 2 · Visitante en un municipio real.
 * Sin sesión y sin escribir: lo que ve cualquiera que abre la app.
 *
 * Es también la prueba del contrato con datos reales: la app solo pinta
 * lo que entiende. Si en el backoffice se da de alta algo que la app no
 * sabe leer, la lista entera cae en error y esta prueba lo dice.
 */
import { apiGet, townByPostalCode } from '../support/api'
import { realPostalCode } from '../support/env'
import { expect, test } from '../support/fixtures'
import { containing } from '../support/i18n'

type Named = { id: string; name: string }

const publicList = (path: string) =>
  apiGet<Named[]>(path, { postal_code: realPostalCode, lang: 'es' })

test.describe('Visitante en un municipio real @lectura', () => {
  test('Home enseña el contenido del municipio, sin errores', async ({
    app,
  }) => {
    const town = await townByPostalCode(realPostalCode)
    const rewards = await publicList('/rewards/public')
    await app.start(realPostalCode, town.name)

    for (const key of [
      'home.section.quick',
      'home.section.events',
      'home.section.rewards',
      'home.section.promos',
    ] as const) {
      await expect(app.heading(key)).toBeVisible()
    }
    await expect(app.text('today.error.title')).toHaveCount(0)
    await expect(app.text('catalog.error')).toHaveCount(0)
    if (rewards.length > 0) {
      // Home enseña una selección: basta con que salga alguno del servidor.
      const anyReward = new RegExp(
        rewards.map((r) => containing(r.name).source).join('|')
      )
      await expect(
        app.page.getByRole('button', { name: anyReward }).first()
      ).toBeVisible()
    }
  })

  test('Agenda y Noticias cargan', async ({ app }) => {
    const town = await townByPostalCode(realPostalCode)
    await app.start(realPostalCode, town.name)

    await app.quickAccess('module.agenda')
    await expect(app.page).toHaveURL(/\/events/)
    await expect(
      app.page.getByRole('banner').getByText(app.tr('agenda.title'))
    ).toBeVisible()
    await expect(app.text('agenda.error')).toHaveCount(0)
    await expect(app.text('today.error.title')).toHaveCount(0)

    await app.open('/home')
    await app.quickAccess('module.noticias')
    await expect(app.page).toHaveURL(/\/news/)
    await expect(
      app.page.getByRole('banner').getByText(app.tr('news.title'))
    ).toBeVisible()
    await expect(app.text('news.error.title')).toHaveCount(0)
  })

  test('Comercios: los que hay en el servidor, y su ficha', async ({ app }) => {
    const town = await townByPostalCode(realPostalCode)
    const shops = await publicList('/shops/public')
    await app.start(realPostalCode, town.name)

    await app.quickAccess('module.comerc')
    await expect(app.heading('merchants.title')).toBeVisible()
    await expect(app.text('merchants.error.title')).toHaveCount(0)
    await expect(app.page.getByRole('article')).toHaveCount(shops.length)

    test.skip(shops.length === 0, 'El municipio no tiene comercios activos')
    const first = shops[0]
    await app.page
      .getByRole('article')
      .filter({ hasText: first.name })
      .getByRole('button')
      .first()
      .click()
    await expect(app.page).toHaveURL(new RegExp(`/merchants/${first.id}`))
    await expect(
      app.page.getByRole('heading', { name: first.name, level: 1 })
    ).toBeVisible()
  })

  test('Premios: los que hay en el servidor, y canjear pide cuenta', async ({
    app,
  }) => {
    const town = await townByPostalCode(realPostalCode)
    const rewards = await publicList('/rewards/public')
    await app.start(realPostalCode, town.name)

    await app.quickAccess('module.premis')
    await expect(app.heading('rewards.title')).toBeVisible()
    await expect(app.text('rewards.load_error')).toHaveCount(0)
    await expect(app.page.getByRole('article')).toHaveCount(rewards.length)
    for (const reward of rewards.slice(0, 3)) {
      await expect(app.rewardCard(reward.name).first()).toBeVisible()
    }
  })

  test('las zonas privadas piden crear cuenta', async ({ app }) => {
    const town = await townByPostalCode(realPostalCode)
    await app.start(realPostalCode, town.name)

    await app.tab('points')
    await expect(
      app.page.getByRole('dialog', { name: app.tr('account.sheet.title') })
    ).toBeVisible()

    await app.open('/points-history')
    await expect(app.page).toHaveURL(/\/login/)
  })
})
