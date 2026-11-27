import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getUpdateRequired,
  resetUpdateRequired,
  subscribeUpdateRequired,
} from '../services/appUpdate'
import { ApiError, apiFetch } from '../services/km0labClient'
import { APP_VERSION, compareVersions, parseVersion } from '../utils/appVersion'

import { mockApi } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  resetUpdateRequired()
})

describe('números de versión', () => {
  it('solo valen tres números separados por puntos', () => {
    expect(parseVersion('1.2.0')).toEqual([1, 2, 0])
    expect(parseVersion(' 10.0.3 ')).toEqual([10, 0, 3])
    expect(parseVersion('1.2')).toBeNull()
    expect(parseVersion('v1.2.0')).toBeNull()
    expect(parseVersion('1.2.0-beta')).toBeNull()
  })

  it('se ordenan por número, no por letras', () => {
    expect(compareVersions('1.0.1', '1.1.0')).toBeLessThan(0)
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0)
    expect(compareVersions('2.0.0', '1.99.99')).toBeGreaterThan(0)
    expect(compareVersions('1.2.0', '1.2.0')).toBe(0)
  })
})

describe('la app dice su versión al servidor', () => {
  it('en todas las peticiones, con sesión o sin ella', async () => {
    const { fetchMock } = mockApi({
      'GET /towns/public': { json: { id: 't1', name: 'Malgrat de Mar' } },
    })

    await apiFetch('/towns/public?postal_code=08380')

    const headers = (fetchMock.mock.calls[0]?.[1]?.headers ?? {}) as Record<
      string,
      string
    >
    expect(headers['X-App-Version']).toBe(APP_VERSION)
    expect(headers['X-App-Platform']).toBe('web')
  })
})

describe('el servidor pide actualizar', () => {
  const tooOld = {
    status: 426,
    json: {
      detail: {
        code: 'app_update_required',
        min_version: '2.0.0',
        your_version: '1.0.1',
      },
    },
  }

  it('la app lo apunta y avisa a quien esté escuchando', async () => {
    mockApi({ 'GET /users/me': tooOld })
    const heard = vi.fn()
    const off = subscribeUpdateRequired(heard)

    await expect(apiFetch('/users/me', { auth: true })).rejects.toBeInstanceOf(
      ApiError
    )
    off()

    expect(getUpdateRequired()).toEqual({ minVersion: '2.0.0' })
    expect(heard).toHaveBeenCalledTimes(1)
  })

  it('otros errores no enseñan la pantalla de actualizar', async () => {
    mockApi({
      'GET /users/me': { status: 426, json: { detail: 'otra cosa' } },
      'GET /towns/public': { status: 500, json: { detail: 'boom' } },
    })

    await expect(apiFetch('/users/me')).rejects.toThrow()
    await expect(apiFetch('/towns/public')).rejects.toThrow()

    expect(getUpdateRequired()).toBeNull()
  })
})
