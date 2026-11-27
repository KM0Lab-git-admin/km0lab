import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, apiFetch, userSchema } from '../services/km0labClient'
import { useAppStore } from '../stores/useAppStore'

import { apiUser, mockApi } from './helpers'

afterEach(() => vi.unstubAllGlobals())

describe('cliente de la API', () => {
  it('manda la sesión solo en las llamadas que la piden', async () => {
    useAppStore.setState({ token: 'jwt-123' })
    const { fetchMock } = mockApi({
      'GET /users/me': { json: apiUser() },
      'GET /towns/public': { json: { id: 't1', name: 'Malgrat de Mar' } },
    })

    await apiFetch('/users/me', { auth: true, schema: userSchema })
    await apiFetch('/towns/public?postal_code=08380')

    const headersOf = (n: number) =>
      (fetchMock.mock.calls[n]?.[1]?.headers ?? {}) as Record<string, string>
    expect(headersOf(0).Authorization).toBe('Bearer jwt-123')
    expect(headersOf(1).Authorization).toBeUndefined()
  })

  it('una respuesta con otra forma se rechaza en vez de pintarse a medias', async () => {
    mockApi({ 'GET /users/me': { json: { id: 'u1' } } })
    await expect(
      apiFetch('/users/me', { auth: true, schema: userSchema })
    ).rejects.toThrow()
  })

  it('si el servidor ya no reconoce la sesión, la app la cierra', async () => {
    useAppStore.setState({
      token: 'jwt-caducado',
      session: {
        user: { id: 'u1', email: 'vecina@example.com', points: 0 },
        createdAt: '2026-11-20T10:00:00.000Z',
      },
    })
    mockApi({
      'GET /users/me': { status: 401, json: { detail: 'Invalid token' } },
    })

    await expect(
      apiFetch('/users/me', { auth: true, schema: userSchema })
    ).rejects.toBeInstanceOf(ApiError)

    expect(useAppStore.getState().token).toBeNull()
    expect(useAppStore.getState().session).toBeNull()
  })

  it('un error de una llamada pública no cierra la sesión', async () => {
    useAppStore.setState({ token: 'jwt-123' })
    mockApi({
      'GET /towns/public': { status: 401, json: { detail: 'Invalid token' } },
    })

    await expect(apiFetch('/towns/public?postal_code=08380')).rejects.toThrow()
    expect(useAppStore.getState().token).toBe('jwt-123')
  })

  it('el mensaje de error es el que da el servidor', async () => {
    mockApi({
      'GET /users/me': {
        status: 422,
        json: { detail: [{ msg: 'value is not a valid email address' }] },
      },
    })
    await expect(apiFetch('/users/me')).rejects.toMatchObject({
      status: 422,
      message: 'value is not a valid email address',
    })
  })
})
