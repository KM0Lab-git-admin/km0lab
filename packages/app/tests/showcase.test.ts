import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { sideNoticeFor } from '../services/auth'
import { useAppStore } from '../stores/useAppStore'
import { contentPoblacion } from '../utils/demoTown'
import { showcaseHomeTown, showcaseTerritory } from '../utils/showcase'

import type { TownChoice } from '../types/territory'

const baix: TownChoice = {
  id: 'm-baix',
  name: 'Baix Montseny',
  artUrl: 'http://api.test/art/breda',
  towns: [
    {
      id: 'l-riells',
      name: 'Riells i Viabrea',
      postalCodes: ['17404'],
      artUrl: null,
    },
    {
      id: 'l-breda',
      name: 'Breda',
      postalCodes: ['17400'],
      artUrl: 'http://api.test/art/breda',
    },
    {
      id: 'l-hostalric',
      name: 'Hostalric',
      postalCodes: ['17450'],
      artUrl: 'http://api.test/art/hostalric',
    },
  ],
}
const blanes: TownChoice = {
  id: 'm-blanes',
  name: 'Blanes',
  artUrl: null,
  towns: [
    { id: 'm-blanes', name: 'Blanes', postalCodes: ['17300'], artUrl: null },
  ],
}

const reset = () => useAppStore.getState().setShowcase(null)
beforeEach(reset)
afterEach(reset)

describe('lo que se ve en la demostración', () => {
  it('fuera de la demostración no hay territorio de demostración', () => {
    expect(showcaseTerritory(null, null)).toBeNull()
    expect(showcaseHomeTown(null, null)).toBeNull()
  })

  it('una población sola: ese es el pueblo, sin vecinas', () => {
    const territory = showcaseTerritory(blanes, null)
    expect(territory?.homeTownId).toBe('m-blanes')
    expect(territory?.towns.map((town) => town.name)).toEqual(['Blanes'])
  })

  it('una agrupación: la elegida primero y las demás por orden alfabético', () => {
    const territory = showcaseTerritory(baix, 'l-hostalric')
    expect(territory?.scopeName).toBe('Baix Montseny')
    expect(territory?.homeTownId).toBe('l-hostalric')
    expect(territory?.towns.map((town) => town.name)).toEqual([
      'Hostalric',
      'Breda',
      'Riells i Viabrea',
    ])
    expect(territory?.towns[0]?.artUrl).toBe('http://api.test/art/hostalric')
  })

  it('sin población de referencia, o con una que ya no está, vale la primera', () => {
    expect(showcaseHomeTown(baix, null)?.name).toBe('Riells i Viabrea')
    expect(showcaseHomeTown(baix, 'ya-no-existe')?.name).toBe(
      'Riells i Viabrea'
    )
  })
})

describe('agenda y noticias de la demostración', () => {
  it('son las de la población elegida', () => {
    useAppStore.getState().setShowcase(baix, 'l-breda')
    expect(contentPoblacion('00000', 'Demo KM0')).toBe('Breda')

    useAppStore.getState().setShowcase(baix, 'l-hostalric')
    expect(contentPoblacion('00000', 'Demo KM0')).toBe('Hostalric')
  })

  it('sin elección (una app anterior a la lista) siguen siendo las de Malgrat', () => {
    expect(contentPoblacion('00000', 'Demo KM0')).toBe('Malgrat de Mar')
  })

  it('un pueblo real no mira la demostración, aunque quede una elección guardada', () => {
    useAppStore.getState().setShowcase(baix, 'l-breda')
    expect(contentPoblacion('17300', 'Blanes')).toBe('Blanes')
  })
})

describe('la cuenta y la app en lados distintos', () => {
  const demo = { postalCode: '00000', town: 'Demo KM0' }
  const malgrat = { postalCode: '08380', town: 'Malgrat de Mar' }

  it('app en la demo, cuenta de un pueblo real: la cuenta se queda y se avisa', () => {
    expect(sideNoticeFor(demo, malgrat)).toEqual({
      kind: 'account_is_real',
      town: 'Malgrat de Mar',
    })
  })

  it('app en un pueblo real, cuenta de demo: no se mueve, se pregunta', () => {
    expect(sideNoticeFor(malgrat, demo)).toEqual({
      kind: 'confirm_leave_demo',
      town: 'Malgrat de Mar',
      postalCode: '08380',
    })
  })

  it('lo normal no avisa de nada', () => {
    expect(sideNoticeFor(demo, demo)).toBeUndefined()
    expect(sideNoticeFor(malgrat, malgrat)).toBeUndefined()
    // Cuenta recién creada sin pueblo todavía, o app sin código postal.
    expect(
      sideNoticeFor(malgrat, { postalCode: null, town: null })
    ).toBeUndefined()
    expect(
      sideNoticeFor({ postalCode: null, town: null }, demo)
    ).toBeUndefined()
  })
})
