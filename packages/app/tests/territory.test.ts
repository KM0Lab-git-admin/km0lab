import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getContentPath, getContentSource } from '../hooks/use-preview-state'
import { listScopeNews } from '../services/municipalListings'
import {
  getTerritory,
  resetTerritoryMemo,
  resolveTerritory,
} from '../services/territory'

import { mockApi } from './helpers'

import type { Territory } from '../types/territory'

const breda = {
  id: 't-breda',
  name: 'Breda',
  slug: 'breda',
  postal_codes: ['17400'],
  art_url: '/api/v1/towns/t-breda/media/art?v=3',
}

/** Un almacén de mentira: en las pruebas no hay navegador. */
const fakeStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', fakeStorage())
  resetTerritoryMemo()
})
afterEach(() => vi.unstubAllGlobals())

describe('territorio de un código postal', () => {
  it('sale del servidor: una población, con sus códigos y su ilustración', async () => {
    const { calls } = mockApi({ 'GET /towns/public': { json: breda } })

    const territory = await getTerritory('17400')

    expect(calls[0]?.path).toBe('/towns/public?postal_code=17400')
    expect(territory).toEqual({
      scopeId: 'town-t-breda',
      scopeName: 'Breda',
      homeTownId: 't-breda',
      towns: [
        {
          id: 't-breda',
          name: 'Breda',
          postalCodes: ['17400'],
          artUrl: 'http://api.test/api/v1/towns/t-breda/media/art?v=3',
        },
      ],
    })
  })

  it('un municipio de un solo pueblo no tiene vecinas: nada inventado', async () => {
    mockApi({ 'GET /towns/public': { json: breda } })
    const territory = await getTerritory('17400')
    expect(territory?.towns).toHaveLength(1)
  })

  it('un municipio que agrupa: mi pueblo primero y las vecinas que da el servidor', async () => {
    mockApi({
      'GET /towns/public': {
        json: {
          id: 'm-baix',
          name: 'Hostalric',
          postal_codes: ['17450'],
          art_url: '/api/v1/towns/localities/l-hostalric/art?v=1',
          locality_id: 'l-hostalric',
          municipality_id: 'm-baix',
          municipality_name: 'Baix Montseny',
          localities: [
            {
              id: 'l-riells',
              name: 'Riells i Viabrea',
              postal_codes: ['17404'],
              art_url: null,
            },
            {
              id: 'l-hostalric',
              name: 'Hostalric',
              postal_codes: ['17450'],
              art_url: '/api/v1/towns/localities/l-hostalric/art?v=1',
            },
            {
              id: 'l-breda',
              name: 'Breda',
              postal_codes: ['17400'],
              art_url: '/api/v1/towns/localities/l-breda/art?v=2',
            },
          ],
        },
      },
    })

    const territory = await getTerritory('17450')

    expect(territory?.scopeId).toBe('town-m-baix')
    expect(territory?.homeTownId).toBe('l-hostalric')
    expect(territory?.towns.map((town) => town.name)).toEqual([
      'Hostalric',
      'Breda',
      'Riells i Viabrea',
    ])
    expect(territory?.towns[1]?.artUrl).toBe(
      'http://api.test/api/v1/towns/localities/l-breda/art?v=2'
    )
    expect(territory?.towns[2]?.artUrl).toBeNull()
  })

  it('un pueblo sin ilustración la deja en null, para que salga la genérica', async () => {
    mockApi({
      'GET /towns/public': {
        json: { id: 't-riells', name: 'Riells i Viabrea', art_url: null },
      },
    })
    const territory = await getTerritory('17404')
    expect(territory?.towns[0]?.artUrl).toBeNull()
    // Una API antigua que no manda los códigos: vale el que se preguntó.
    expect(territory?.towns[0]?.postalCodes).toEqual(['17404'])
  })

  it('un código postal sin municipio devuelve null', async () => {
    mockApi({
      'GET /towns/public': {
        status: 404,
        json: { detail: 'Unknown postal code' },
      },
    })
    expect(await getTerritory('01234')).toBeNull()
  })

  it('sin conexión lanza, para que la pantalla lo diga', async () => {
    mockApi({ 'GET /towns/public': new TypeError('Failed to fetch') })
    await expect(getTerritory('17400')).rejects.toThrow('Failed to fetch')
  })

  it('recuerda la última respuesta del servidor y la da al instante', async () => {
    expect(resolveTerritory('17400')).toBeNull()

    mockApi({ 'GET /towns/public': { json: breda } })
    const fresh = await getTerritory('17400')

    expect(resolveTerritory('17400')).toEqual(fresh)
    // Y la olvida si el servidor deja de reconocer el código postal.
    resetTerritoryMemo()
    mockApi({ 'GET /towns/public': { status: 404, json: { detail: 'x' } } })
    await getTerritory('17400')
    expect(resolveTerritory('17400')).toBeNull()
  })

  it('dos preguntas seguidas por el mismo código postal son una sola petición', async () => {
    const { fetchMock } = mockApi({ 'GET /towns/public': { json: breda } })

    const [a, b] = await Promise.all([
      getTerritory('17400'),
      getTerritory('17400'),
    ])
    await getTerritory('17400')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(a).toEqual(b)
  })

  it('un fallo de red no se queda recordado', async () => {
    mockApi({ 'GET /towns/public': new TypeError('Failed to fetch') })
    await expect(getTerritory('17400')).rejects.toThrow()

    mockApi({ 'GET /towns/public': { json: breda } })
    expect((await getTerritory('17400'))?.scopeName).toBe('Breda')
  })

  it('no pregunta por algo que no es un código postal', async () => {
    const { fetchMock } = mockApi({})
    expect(await getTerritory('abc')).toBeNull()
    expect(resolveTerritory('1740')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('contenido del ámbito', () => {
  const territory: Territory = {
    scopeId: 'town-t-breda',
    scopeName: 'Breda',
    homeTownId: 't-breda',
    towns: [{ id: 't-breda', name: 'Breda', postalCodes: ['17400'] }],
  }

  it('las noticias se piden al servidor de eventos, por población', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      expect(String(input)).toContain('http://events.test')
      return new Response(
        JSON.stringify({ data: [], total: 0, limit: 20, offset: 0 }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const listing = await listScopeNews(territory)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(listing).toEqual({ home: [], nearby: [], failedTownIds: [] })
  })

  it('en producción no existe el contenido «de muestra»', () => {
    expect(getContentSource('sample')).toBe('live')
    expect(getContentPath('/events?x=1', 'sample')).toBe('/events?x=1')
  })
})
