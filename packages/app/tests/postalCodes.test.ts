import { afterEach, describe, expect, it, vi } from 'vitest'

import { lookupTown } from '../utils/postalCodes'

import { mockApi } from './helpers'

const town = (name: string) => ({ json: { id: 't1', name } })

afterEach(() => vi.unstubAllGlobals())

// `lookupTown` recuerda lo que ya preguntó: cada prueba usa su código postal.
describe('código postal → municipio', () => {
  it('un municipio dado de alta devuelve su nombre, y no vuelve a preguntar', async () => {
    const { fetchMock } = mockApi({
      'GET /towns/public': town('Malgrat de Mar'),
    })

    expect(await lookupTown('08380')).toBe('Malgrat de Mar')
    expect(await lookupTown(' 08380 ')).toBe('Malgrat de Mar')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('un código postal que no es de ningún municipio devuelve null', async () => {
    mockApi({
      'GET /towns/public': {
        status: 404,
        json: { detail: 'Unknown postal code' },
      },
    })
    expect(await lookupTown('01234')).toBeNull()
  })

  it('sin conexión lanza: la pantalla distingue «no existe» de «no hay red»', async () => {
    mockApi({ 'GET /towns/public': new TypeError('Failed to fetch') })
    await expect(lookupTown('17300')).rejects.toThrow('Failed to fetch')
  })

  it('un fallo de red no se queda guardado como «no existe»', async () => {
    mockApi({ 'GET /towns/public': new TypeError('Failed to fetch') })
    await expect(lookupTown('17310')).rejects.toThrow()

    mockApi({ 'GET /towns/public': town('Lloret de Mar') })
    expect(await lookupTown('17310')).toBe('Lloret de Mar')
  })

  it('el código de demostración no pregunta al servidor', async () => {
    const { fetchMock } = mockApi({})
    expect(await lookupTown('00000')).toBe('Demo KM0')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['', '123', 'abcde', '083800'])(
    '«%s» no es un código postal y no pregunta',
    async (value) => {
      const { fetchMock } = mockApi({})
      expect(await lookupTown(value)).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )
})

describe('código postal de un municipio que agrupa pueblos', () => {
  it('confirma el pueblo del vecino, no el nombre del municipio', async () => {
    mockApi({
      'GET /towns/public': {
        json: {
          id: 'm-baix',
          name: 'Breda',
          locality_id: 'l-breda',
          municipality_id: 'm-baix',
          municipality_name: 'Baix Montseny',
          localities: [
            { id: 'l-breda', name: 'Breda', postal_codes: ['17400'] },
            { id: 'l-hostalric', name: 'Hostalric', postal_codes: ['17450'] },
          ],
        },
      },
    })
    expect(await lookupTown('17400')).toBe('Breda')
  })
})
