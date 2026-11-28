import { afterEach, describe, expect, it, vi } from 'vitest'

import { acceptTerms, fetchTermsPending, needsTerms } from '../services/terms'
import { useAppStore } from '../stores/useAppStore'
import { TERMS_VERSION } from '../utils/legalText'

import { apiUser, mockApi } from './helpers'

afterEach(() => vi.unstubAllGlobals())

describe('condiciones del piloto: quién tiene que aceptarlas', () => {
  it('quien nunca aceptó o aceptó una versión anterior', () => {
    expect(needsTerms(null)).toBe(true)
    expect(needsTerms('0')).toBe(true)
    expect(needsTerms(TERMS_VERSION)).toBe(false)
  })

  it('no pregunta si el servidor todavía no manda el dato', () => {
    // Aceptar no cambiaría la respuesta: la pantalla no se iría nunca.
    expect(needsTerms(undefined)).toBe(false)
  })

  it('lo pregunta al servidor con la sesión abierta', async () => {
    useAppStore.setState({ token: 'jwt' })
    mockApi({ 'GET /users/me': { json: apiUser({ terms_version: null }) } })
    expect(await fetchTermsPending()).toBe(true)

    mockApi({
      'GET /users/me': { json: apiUser({ terms_version: TERMS_VERSION }) },
    })
    expect(await fetchTermsPending()).toBe(false)
  })

  it('«Continuar» manda la versión aceptada y nada más', async () => {
    useAppStore.setState({ token: 'jwt' })
    const { first } = mockApi({
      'PATCH /users/me': { json: apiUser({ terms_version: TERMS_VERSION }) },
    })

    expect(await acceptTerms()).toBe(true)
    expect(first().body).toEqual({ terms_version: TERMS_VERSION })
  })

  it('si no queda apuntada, la pantalla sigue ahí', async () => {
    useAppStore.setState({ token: 'jwt' })
    mockApi({ 'PATCH /users/me': { json: apiUser({ terms_version: null }) } })
    expect(await acceptTerms()).toBe(false)

    mockApi({ 'PATCH /users/me': new TypeError('sin red') })
    expect(await acceptTerms()).toBe(false)
  })
})
