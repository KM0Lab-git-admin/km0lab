/**
 * Se entra una vez: la App renueva la sesión sola, y una mala conexión no
 * echa a nadie.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  forgetLastRenewal,
  keepSessionAlive,
  renewSession,
} from '../services/auth'
import { useAppStore } from '../stores/useAppStore'

import { apiUser, mockApi } from './helpers'

const signedIn = (token = 'credencial-de-antes') =>
  useAppStore.setState({
    token,
    session: {
      user: { id: 'u1', email: 'vecina@example.com', points: 10 },
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  })

const renewed = (token = 'credencial-nueva', over = {}) => ({
  json: { access_token: token, token_type: 'bearer', user: apiUser(over) },
})

// Las pruebas corren sin navegador: un «documento» mínimo que sabe avisar de
// que la App vuelve a primer plano. Es siempre el mismo, porque la App se
// suscribe una sola vez.
const page = Object.assign(new EventTarget(), { visibilityState: 'visible' })

beforeEach(() => {
  forgetLastRenewal()
  vi.stubGlobal('document', page)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  useAppStore.getState().signOut()
})

describe('la sesión se renueva sola', () => {
  it('cambia la credencial por la nueva sin tocar la sesión', async () => {
    signedIn()
    const { first } = mockApi({
      'POST /auth/renew': renewed('credencial-nueva', { points: 120 }),
    })

    expect(await renewSession()).toBe('renewed')

    expect(first().method).toBe('POST')
    const state = useAppStore.getState()
    expect(state.token).toBe('credencial-nueva')
    expect(state.session?.user.id).toBe('u1')
    expect(state.session?.user.points).toBe(120)
  })

  it('sin sesión no pide nada', async () => {
    const { calls } = mockApi({})
    expect(await renewSession()).toBe('kept')
    expect(calls).toHaveLength(0)
  })

  it('sin conexión se queda como estaba: nadie sale por la cobertura', async () => {
    signedIn()
    mockApi({ 'POST /auth/renew': new TypeError('Failed to fetch') })

    expect(await renewSession()).toBe('kept')

    const state = useAppStore.getState()
    expect(state.token).toBe('credencial-de-antes')
    expect(state.session?.user.id).toBe('u1')
  })

  it('un fallo del servidor tampoco cierra la sesión', async () => {
    signedIn()
    mockApi({ 'POST /auth/renew': { status: 503, json: { detail: 'down' } } })

    expect(await renewSession()).toBe('kept')
    expect(useAppStore.getState().token).toBe('credencial-de-antes')
  })

  it('si el servidor dice que la sesión ya no vale, se sale', async () => {
    signedIn()
    mockApi({
      'POST /auth/renew': { status: 401, json: { detail: 'Session closed' } },
    })

    expect(await renewSession()).toBe('kept')

    const state = useAppStore.getState()
    expect(state.token).toBeNull()
    expect(state.session).toBeNull()
  })

  it('con un servidor que aún no sabe renovar, comprueba la sesión como antes', async () => {
    signedIn()
    const { calls } = mockApi({
      'POST /auth/renew': { status: 404, json: { detail: 'Not Found' } },
      'GET /users/me': { json: apiUser() },
    })

    expect(await renewSession()).toBe('kept')

    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      'POST /auth/renew',
      'GET /users/me',
    ])
    expect(useAppStore.getState().token).toBe('credencial-de-antes')
  })

  it('una respuesta que llega después de cerrar sesión no la reabre', async () => {
    signedIn()
    mockApi({
      'POST /auth/renew': () => {
        // La persona pulsa «Cerrar sesión» mientras la petición está en vuelo.
        useAppStore.getState().signOut()
        return renewed()
      },
    })

    expect(await renewSession()).toBe('kept')
    expect(useAppStore.getState().token).toBeNull()
  })
})

describe('cuándo se renueva', () => {
  it('al abrir la App, y como mucho una vez al día', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-12-01T10:00:00Z'))
    signedIn()
    const { calls } = mockApi({ 'POST /auth/renew': renewed() })

    keepSessionAlive()
    keepSessionAlive()
    await vi.waitFor(() => expect(calls).toHaveLength(1))

    // Vuelve a primer plano a las pocas horas: no hace falta.
    vi.setSystemTime(new Date('2026-12-01T18:00:00Z'))
    page.dispatchEvent(new Event('visibilitychange'))
    expect(calls).toHaveLength(1)

    // La App se quedó abierta y vuelve a primer plano al día siguiente.
    vi.setSystemTime(new Date('2026-12-02T10:00:01Z'))
    page.dispatchEvent(new Event('visibilitychange'))
    await vi.waitFor(() => expect(calls).toHaveLength(2))
  })

  it('sin sesión no hay nada que renovar', () => {
    const { calls } = mockApi({})
    keepSessionAlive()
    page.dispatchEvent(new Event('visibilitychange'))
    expect(calls).toHaveLength(0)
  })
})
