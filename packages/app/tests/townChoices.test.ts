import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCachedTownChoices, listTownChoices } from '../services/townChoices'
import { useAppStore } from '../stores/useAppStore'

import { mockApi } from './helpers'

/**
 * Lo que contesta `GET /towns` en UAT: un municipio de un solo pueblo sale
 * una vez; uno que agrupa, una vez por población y con todas en `localities`.
 */
const localities = [
  {
    id: 'l-breda',
    name: 'Breda',
    slug: 'breda',
    postal_codes: ['17400'],
    art_url: '/api/v1/towns/localities/l-breda/art?v=7',
  },
  {
    id: 'l-hostalric',
    name: 'Hostalric',
    slug: 'hostalric',
    postal_codes: ['17450'],
    art_url: '/api/v1/towns/localities/l-hostalric/art?v=7',
  },
  {
    id: 'l-riells',
    name: 'Riells i Viabrea',
    slug: 'riells-i-viabrea',
    postal_codes: ['17404'],
    art_url: null,
  },
]
const baixEntry = (locality: (typeof localities)[number]) => ({
  id: 'm-baix',
  name: locality.name,
  slug: locality.slug,
  postal_codes: locality.postal_codes,
  art_url: locality.art_url,
  locality_id: locality.id,
  municipality_id: 'm-baix',
  municipality_name: 'Baix Montseny',
  localities,
})
const townList = [
  {
    id: 'm-malgrat',
    name: 'Malgrat de Mar',
    postal_codes: ['08380'],
    art_url: '/api/v1/towns/m-malgrat/media/art?v=3',
    locality_id: 'l-malgrat',
    municipality_id: 'm-malgrat',
    municipality_name: 'Malgrat de Mar',
    localities: [
      {
        id: 'l-malgrat',
        name: 'Malgrat de Mar',
        postal_codes: ['08380'],
        art_url: '/api/v1/towns/m-malgrat/media/art?v=3',
      },
    ],
  },
  ...localities.map(baixEntry),
  {
    id: 'm-blanes',
    name: 'Blanes',
    postal_codes: ['17300'],
    municipality_id: 'm-blanes',
    municipality_name: 'Blanes',
  },
]

/** Un almacén de mentira: en las pruebas no hay navegador. */
const fakeStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

beforeEach(() => vi.stubGlobal('localStorage', fakeStorage()))
afterEach(() => vi.unstubAllGlobals())

describe('poblaciones de la demostración', () => {
  it('salen del servidor: una opción por municipio, por orden alfabético', async () => {
    const { calls } = mockApi({ 'GET /towns': { json: townList } })

    const choices = await listTownChoices()

    expect(calls[0]?.path).toBe('/towns')
    expect(choices.map((choice) => choice.name)).toEqual([
      'Baix Montseny',
      'Blanes',
      'Malgrat de Mar',
    ])
  })

  it('un municipio que agrupa es una sola opción con sus poblaciones', async () => {
    mockApi({ 'GET /towns': { json: townList } })

    const [baix, blanes] = await listTownChoices()

    expect(baix?.id).toBe('m-baix')
    expect(baix?.towns.map((town) => town.name)).toEqual([
      'Breda',
      'Hostalric',
      'Riells i Viabrea',
    ])
    expect(baix?.towns.map((town) => town.postalCodes)).toEqual([
      ['17400'],
      ['17450'],
      ['17404'],
    ])
    // La ilustración viene como ruta de la API: se completa con su dirección.
    expect(baix?.artUrl).toBe(
      'http://api.test/api/v1/towns/localities/l-breda/art?v=7'
    )
    expect(baix?.towns[2]?.artUrl).toBeNull()
    expect(blanes?.towns).toEqual([
      { id: 'm-blanes', name: 'Blanes', postalCodes: ['17300'], artUrl: null },
    ])
  })

  it('ordena sin mirar acentos ni mayúsculas y tolera campos que faltan', async () => {
    mockApi({
      'GET /towns': {
        json: [
          { id: 'z', name: 'zeta' },
          { id: 'a', name: 'Àvila' },
        ],
      },
    })

    const choices = await listTownChoices()

    expect(choices.map((choice) => choice.name)).toEqual(['Àvila', 'zeta'])
    expect(choices[0]?.towns[0]).toEqual({
      id: 'a',
      name: 'Àvila',
      postalCodes: [],
      artUrl: null,
    })
  })

  it('si el servidor falla o contesta otra cosa, lanza: la lista enseña su error', async () => {
    mockApi({ 'GET /towns': { status: 500, json: { detail: 'x' } } })
    await expect(listTownChoices()).rejects.toThrow()

    mockApi({ 'GET /towns': new TypeError('offline') })
    await expect(listTownChoices()).rejects.toThrow()

    mockApi({ 'GET /towns': { json: { not: 'a list' } } })
    await expect(listTownChoices()).rejects.toThrow()
  })

  it('recuerda la última lista del servidor para pintarla sin espera', async () => {
    expect(getCachedTownChoices()).toBeNull()
    mockApi({ 'GET /towns': { json: townList } })
    const fresh = await listTownChoices()

    expect(getCachedTownChoices()).toEqual(fresh)
  })

  it('lo recordado se valida al leerlo: si no vale, se ignora', () => {
    localStorage.setItem('km0_town_choices', '{"roto":')
    expect(getCachedTownChoices()).toBeNull()
    localStorage.setItem('km0_town_choices', JSON.stringify([{ id: 1 }]))
    expect(getCachedTownChoices()).toBeNull()
  })
})

describe('marca de demostración', () => {
  it('se enciende al elegir una opción y se apaga al salir', () => {
    const choice = { id: 'm', name: 'Grup', artUrl: null, towns: [] }
    expect(useAppStore.getState().isShowcase).toBe(false)

    useAppStore.getState().setShowcase(choice)
    expect(useAppStore.getState().isShowcase).toBe(true)
    expect(useAppStore.getState().showcaseChoice).toEqual(choice)

    useAppStore.getState().setShowcase(null)
    expect(useAppStore.getState().isShowcase).toBe(false)
    expect(useAppStore.getState().showcaseChoice).toBeNull()
  })
})
