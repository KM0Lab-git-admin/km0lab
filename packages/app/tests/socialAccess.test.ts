/**
 * Entrar con una red, «falta tu correo», cómo entro yo y cerrar en todos los
 * dispositivos, contra una API de mentira. La ventana de cada red se simula:
 * aquí se prueba lo que hace la App con lo que la red entrega.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { verifyOtp } from '../services/auth'
import { pendingLinkToken } from '../services/linkToken'
import {
  forgetAuthProviders,
  getAuthProviders,
  linkProvider,
  loginWithProvider,
  logoutEverywhere,
  signInMethodsFromApi,
} from '../services/socialAccess'
import { getNetworkCredential, NetworkCancelled } from '../services/socialSdk'
import { useAppStore } from '../stores/useAppStore'
import { TERMS_VERSION } from '../utils/legalText'

import { apiUser, mockApi } from './helpers'

import type * as SocialSdkModule from '../services/socialSdk'

type SocialSdk = typeof SocialSdkModule

vi.mock('../services/socialSdk', async (original) => ({
  ...(await original<SocialSdk>()),
  getNetworkCredential: vi.fn(),
}))
const network = vi.mocked(getNetworkCredential)

const memory = new Map<string, string>()
beforeEach(() => {
  memory.clear()
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  })
  forgetAuthProviders()
  network.mockReset()
  useAppStore.setState({
    token: null,
    session: null,
    postalCode: '08380',
    town: 'Malgrat de Mar',
  })
})
afterEach(() => vi.unstubAllGlobals())

const providers = {
  json: {
    providers: [
      { provider: 'google', client_id: 'google-client' },
      { provider: 'facebook', client_id: 'facebook-app' },
      { provider: 'apple', client_id: 'com.km0lab.app.web' },
    ],
  },
}
const signedIn = (over = {}) => ({
  json: {
    access_token: 'jwt-nou',
    token_type: 'bearer',
    user: apiUser(over),
    points_awarded: null,
  },
})

describe('qué redes se ofrecen', () => {
  it('las que dice el servidor, y ninguna si no contesta', async () => {
    mockApi({ 'GET /auth/providers': providers })
    expect((await getAuthProviders()).map((p) => p.provider)).toEqual([
      'google',
      'facebook',
      'apple',
    ])

    forgetAuthProviders()
    mockApi({ 'GET /auth/providers': new TypeError('sin red') })
    expect(await getAuthProviders()).toEqual([])

    forgetAuthProviders()
    mockApi({
      'GET /auth/providers': {
        json: { providers: [{ provider: 'twitter', client_id: 'x' }] },
      },
    })
    expect(await getAuthProviders()).toEqual([])
  })
})

describe('entrar con una red', () => {
  it('Apple: pide el nonce, se lo da a Apple y lo devuelve con la credencial', async () => {
    network.mockResolvedValue({
      credential: 'apple-id-token',
      firstName: 'Marta',
      lastName: 'Puig',
    })
    const { calls } = mockApi({
      'GET /auth/providers': providers,
      'POST /auth/social/apple/nonce': {
        json: { nonce: 'n-1', nonce_token: 'nt-1' },
      },
      'POST /auth/social/apple': signedIn(),
      'PATCH /users/me': { json: apiUser() },
    })

    const result = await loginWithProvider('apple', {
      referralReference: 'abc123',
    })

    expect(result.error).toBeNull()
    expect(network).toHaveBeenCalledWith('apple', 'com.km0lab.app.web', 'n-1')
    const social = calls.find((c) => c.path === '/auth/social/apple')
    expect(social?.body).toMatchObject({
      credential: 'apple-id-token',
      nonce_token: 'nt-1',
      postal_code: '08380',
      invite_code: 'abc123',
      terms_version: TERMS_VERSION,
      first_name: 'Marta',
      last_name: 'Puig',
    })
    // Dentro, igual que con el código.
    expect(useAppStore.getState().token).toBe('jwt-nou')
    expect(useAppStore.getState().session?.user.id).toBe('u1')
  })

  it('Facebook: sin nonce; sin correo de fiar, «falta tu correo» y el código lo enlaza', async () => {
    network.mockResolvedValue({ credential: 'fb-token' })
    mockApi({
      'GET /auth/providers': providers,
      'POST /auth/social/facebook': {
        status: 409,
        json: {
          detail: {
            code: 'email_missing',
            message: 'Falta el teu correu.',
            link_token: 'lt-1',
          },
        },
      },
    })

    const result = await loginWithProvider('facebook')
    expect(result.error?.code).toBe('email_missing')
    expect(network).toHaveBeenCalledWith('facebook', 'facebook-app', undefined)
    expect(pendingLinkToken()).toBe('lt-1')
    expect(useAppStore.getState().token).toBeNull()

    // Confirma su correo con el código: el testigo viaja y se gasta.
    const { calls } = mockApi({
      'POST /auth/verify-otp': signedIn(),
      'PATCH /users/me': { json: apiUser() },
    })
    expect((await verifyOtp('pere@example.com', '123456')).error).toBeNull()
    expect(calls[0].body).toMatchObject({ link_token: 'lt-1' })
    expect(pendingLinkToken()).toBeNull()
  })

  it('cerrar la ventana de la red no es un error', async () => {
    network.mockRejectedValue(new NetworkCancelled())
    mockApi({
      'GET /auth/providers': providers,
      'POST /auth/social/google/nonce': {
        json: { nonce: 'n', nonce_token: 'nt' },
      },
    })
    expect(await loginWithProvider('google')).toEqual({
      error: null,
      cancelled: true,
    })
  })

  it('cada fallo con su nombre', async () => {
    network.mockResolvedValue({ credential: 'g' })
    const answer = (status: number, detail: unknown) => {
      forgetAuthProviders()
      mockApi({
        'GET /auth/providers': providers,
        'POST /auth/social/google/nonce': {
          json: { nonce: 'n', nonce_token: 'nt' },
        },
        'POST /auth/social/google': { status, json: { detail } },
      })
      return loginWithProvider('google')
    }
    expect((await answer(409, { code: 'pilot_full' })).error?.code).toBe(
      'pilot_full'
    )
    expect((await answer(401, { code: 'provider_failed' })).error?.code).toBe(
      'provider_failed'
    )
    expect((await answer(503, { code: 'provider_failed' })).error?.code).toBe(
      'provider_failed'
    )
    expect((await answer(429, { code: 'rate_limited' })).error?.code).toBe(
      'ip_limited'
    )
    expect((await answer(403, { code: 'use_email' })).error?.code).toBe(
      'provider_failed'
    )
  })

  it('una red que no está encendida no abre nada', async () => {
    mockApi({ 'GET /auth/providers': { json: { providers: [] } } })
    expect((await loginWithProvider('google')).error?.code).toBe(
      'provider_failed'
    )
    expect(network).not.toHaveBeenCalled()
  })
})

describe('con la sesión abierta', () => {
  it('enlazar una red que no responde no cierra la sesión', async () => {
    useAppStore.setState({
      token: 'jwt-marta',
      session: {
        user: { id: 'u1', email: 'marta@example.com', points: 0 },
        createdAt: 'x',
      },
    })
    network.mockResolvedValue({ credential: 'g' })
    mockApi({
      'GET /auth/providers': providers,
      'POST /auth/social/google/nonce': {
        json: { nonce: 'n', nonce_token: 'nt' },
      },
      'POST /auth/social/google': {
        status: 401,
        json: { detail: { code: 'provider_failed' } },
      },
    })
    expect((await linkProvider('google')).error?.code).toBe('provider_failed')
    expect(useAppStore.getState().token).toBe('jwt-marta')
  })

  it('cómo entro: por dónde nació la cuenta y las redes enlazadas', () => {
    expect(
      signInMethodsFromApi({
        created_with: 'apple',
        email: 'x7k@privaterelay.appleid.com',
        email_hidden: true,
        methods: [
          { provider: 'apple', linked_at: '2026-11-01T10:00:00' },
          { provider: 'email_code', linked_at: '2026-11-20T10:00:00' },
        ],
      })
    ).toEqual({
      createdWith: 'apple',
      email: {
        address: 'x7k@privaterelay.appleid.com',
        linkedAt: '2026-11-20T10:00:00',
      },
      providers: [{ provider: 'apple', linkedAt: '2026-11-01T10:00:00' }],
    })
    expect(
      signInMethodsFromApi({
        created_with: 'email_code',
        email: 'a@b.c',
        methods: [],
      }).createdWith
    ).toBe('email')
  })

  it('cerrar en todos los dispositivos: solo sale si el servidor lo confirma', async () => {
    useAppStore.setState({
      token: 'jwt-marta',
      session: {
        user: { id: 'u1', email: 'marta@example.com', points: 0 },
        createdAt: 'x',
      },
    })
    mockApi({
      'POST /auth/logout-all': { status: 503, json: { detail: 'down' } },
    })
    expect((await logoutEverywhere()).error).not.toBeNull()
    expect(useAppStore.getState().token).toBe('jwt-marta')

    mockApi({ 'POST /auth/logout-all': { json: { message: 'ok' } } })
    expect(await logoutEverywhere()).toEqual({ error: null })
    expect(useAppStore.getState().token).toBeNull()
  })
})
