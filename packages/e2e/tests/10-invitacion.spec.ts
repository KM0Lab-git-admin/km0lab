/**
 * Recorrido 10 · Invitación de punta a punta.
 * Un vecino copia su enlace, otra persona se registra con él en otro
 * móvil, y al primero le aparece la invitación y sus puntos.
 */
import { devices } from '@playwright/test'

import { apiGet, me, qaLogin } from '../support/api'
import { App } from '../support/app'
import { baseURL, qaPostalCode, qaTownName } from '../support/env'
import { expect, test } from '../support/fixtures'

type InviteLink = { public_code: string }

test.describe('Invitación @qa', () => {
  test('quien invita cobra cuando el invitado se registra', async ({
    app,
    browser,
    context,
    newEmail,
  }) => {
    const inviter = newEmail('invita')
    const invitee = newEmail('invitado')

    await app.start(qaPostalCode, qaTownName)
    await app.login(inviter, { expectWelcome: true })
    await app.closeWelcome()
    const session = await qaLogin(inviter)
    const before = (await me(session.access_token)).points

    let code = ''
    await test.step('copia su enlace de invitación', async () => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await app.open('/invite')
      await expect(app.heading('invite.home.title')).toBeVisible()
      await app.button('share.copy').click()

      const link = await apiGet<InviteLink>(
        '/invites/me/link',
        { kind: 'person' },
        session.access_token
      )
      code = link.public_code
      const copied = await app.page.evaluate(() =>
        navigator.clipboard.readText()
      )
      expect(copied).toContain(`/i/${code}`)
    })

    await test.step('otra persona abre el enlace y se registra', async () => {
      const other = await browser.newContext({
        ...devices['Pixel 7'],
        baseURL,
        locale: 'es-ES',
      })
      const guest = new App(await other.newPage(), 'es')
      await guest.open(`/i/${code}`)
      await guest.page.waitForURL((url) => !url.pathname.startsWith('/i/'))
      await guest.chooseLanguage()
      await guest.skipOnboarding()
      await guest.enterPostalCode(qaPostalCode, qaTownName)
      await guest.login(invitee, { expectWelcome: true })
      await other.close()
    })

    await test.step('al que invitó le llegan los puntos y lo ve', async () => {
      await expect
        .poll(async () => (await me(session.access_token)).points)
        .toBeGreaterThan(before)
      const after = (await me(session.access_token)).points

      await app.open('/my-invitations')
      await expect(app.heading('invites.title')).toBeVisible()
      await expect(
        app.page.getByText(`+${after - before}`).first()
      ).toBeVisible()
      await app.expectHistoryBalance(after)
    })
  })
})
