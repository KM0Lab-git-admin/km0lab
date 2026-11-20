/**
 * Recorridos 6, 7 y 8 · Canjes.
 * Un vale da código; un producto no; sin saldo o sin existencias no se
 * puede canjear. Cada prueba usa un vecino nuevo del territorio de pruebas.
 */
import { me, qaLogin } from '../support/api'
import { qaPostalCode, qaTownName } from '../support/env'
import { expect, test } from '../support/fixtures'

// Sembrados en km0lab-api (app/services/qa_territory.py).
const VOUCHER = { name: '[QA] Vale de 5 €', cost: 50 }
const PRODUCT = { name: '[QA] Bolsa de pruebas', cost: 30 }
const SOLD_OUT = '[QA] Camiseta agotada'
const OUT_OF_REACH = '[QA] Experiencia inalcanzable'

test.describe('Canjes @qa', () => {
  test('canjear un vale descuenta los puntos y da un código', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('vale')
    await app.start(qaPostalCode, qaTownName)
    await app.login(email, { expectWelcome: true })
    await app.closeWelcome()
    const session = await qaLogin(email)
    const before = (await me(session.access_token)).points

    const done = await app.redeem(VOUCHER.name)
    await expect(done.getByText(app.tr('redeem.code_label'))).toBeVisible()
    const code = (await done.getByText(/^\d{5}$/).innerText()).trim()
    await done.getByRole('button', { name: app.tr('redeem.cta_done') }).click()

    await test.step('el servidor descontó exactamente el precio', async () => {
      const after = (await me(session.access_token)).points
      expect(after).toBe(before - VOUCHER.cost)
      await app.expectCatalogBalance(after)
      await app.expectHistoryBalance(after)
    })

    await test.step('el canje aparece en «Mis canjes» con su código', async () => {
      await app.tab('rewards')
      await expect(app.heading('redemptions.title')).toBeVisible()
      const card = app.rewardCard(VOUCHER.name)
      await expect(card).toHaveCount(1)
      await expect(card).toContainText(code)
    })
  })

  test('canjear un producto descuenta los puntos y no da código', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('producto')
    await app.start(qaPostalCode, qaTownName)
    await app.login(email, { expectWelcome: true })
    await app.closeWelcome()
    const session = await qaLogin(email)
    const before = (await me(session.access_token)).points

    const done = await app.redeem(PRODUCT.name)
    await expect(done.getByText(/^\d{5}$/)).toHaveCount(0)
    await done.getByRole('button', { name: app.tr('redeem.cta_done') }).click()

    expect((await me(session.access_token)).points).toBe(before - PRODUCT.cost)
    await app.tab('rewards')
    const card = app.rewardCard(PRODUCT.name)
    await expect(card).toHaveCount(1)
    await expect(card.getByText(/^\d{5}$/)).toHaveCount(0)
  })

  test('sin saldo o sin existencias la app no deja canjear', async ({
    app,
    newEmail,
  }) => {
    const email = newEmail('imposible')
    await app.start(qaPostalCode, qaTownName)
    await app.login(email, { expectWelcome: true })
    await app.closeWelcome()
    const session = await qaLogin(email)
    const before = (await me(session.access_token)).points

    await app.open('/rewards')
    await expect(app.heading('rewards.title')).toBeVisible()

    const soldOut = app
      .rewardCard(SOLD_OUT)
      .getByRole('button', { name: app.tr('rewards.cta.sold_out') })
    await expect(soldOut).toBeDisabled()

    const locked = app.rewardCard(OUT_OF_REACH).getByRole('button')
    await expect(locked).toBeDisabled()
    await expect(locked).not.toHaveText(app.tr('rewards.cta.redeem'))

    expect((await me(session.access_token)).points).toBe(before)
  })
})
