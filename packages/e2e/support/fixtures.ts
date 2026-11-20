import { test as base, expect } from '@playwright/test'

import { qaEmail, robotHeaders } from './api'
import { App } from './app'
import { apiURL } from './env'

type Fixtures = {
  /** La app en castellano. Para otro idioma: `new App(page, 'ca')`. */
  app: App
  /** Fábrica de cuentas nuevas de esta ejecución (territorio de pruebas). */
  newEmail: (name: string) => string
}

export const test = base.extend<Fixtures>({
  // Las llamadas de la app a la API de negocio llevan la clave del robot
  // (si la hay). Solo a esa API: no se manda a ningún otro servidor.
  context: async ({ context }, provide) => {
    if (Object.keys(robotHeaders).length > 0) {
      await context.route(`${apiURL}/**`, (route) =>
        route.continue({
          headers: { ...route.request().headers(), ...robotHeaders },
        })
      )
    }
    await provide(context)
  },
  app: async ({ page }, provide) => {
    await provide(new App(page, 'es'))
  },
  newEmail: async ({}, provide, testInfo) => {
    // Un reintento usa otra cuenta: la anterior pudo quedar a medias.
    const suffix = testInfo.retry ? `-i${testInfo.retry}` : ''
    await provide((name: string) => qaEmail(`${name}${suffix}`))
  },
})

export { expect }
