/**
 * Escaneo pendiente: abrir el enlace de un comercio sin sesión, o sin haber
 * usado nunca la app, no puede obligar a escanear otra vez.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '../stores/useAppStore'
import {
  PENDING_SCAN_TTL_MS,
  isPendingScanFresh,
  pendingScanStep,
  scannerPathFor,
} from '../utils/pendingScan'

import type { PendingScanContext } from '../utils/pendingScan'

const NOW = 1_800_000_000_000
const pending = { code: 'abc123', at: NOW - 60_000 }

/** Vecino con todo en regla y un escaneo pendiente; cada prueba quita algo. */
const ctx = (over: Partial<PendingScanContext> = {}): PendingScanContext => ({
  pending,
  now: NOW,
  ready: true,
  setupDone: true,
  hasSession: true,
  pathname: '/home',
  loginPrompted: false,
  ...over,
})

describe('escaneo pendiente', () => {
  it('sin nada pendiente no hace nada', () => {
    expect(pendingScanStep(ctx({ pending: null }))).toBe('none')
  })

  it('quien nunca ha usado la app: espera a idioma y código postal', () => {
    expect(
      pendingScanStep(
        ctx({ setupDone: false, hasSession: false, pathname: '/' })
      )
    ).toBe('wait')
    expect(
      pendingScanStep(
        ctx({ setupDone: false, hasSession: false, pathname: '/onboarding' })
      )
    ).toBe('wait')
  })

  it('con idioma y código postal pero sin sesión: se le lleva a entrar', () => {
    expect(pendingScanStep(ctx({ hasSession: false }))).toBe('login')
  })

  it('mientras entra no se le interrumpe, y solo se le lleva una vez', () => {
    for (const pathname of ['/login', '/check-email']) {
      expect(pendingScanStep(ctx({ hasSession: false, pathname }))).toBe('wait')
    }
    expect(
      pendingScanStep(ctx({ hasSession: false, loginPrompted: true }))
    ).toBe('wait')
  })

  it('al tener sesión se retoma el escaneo, venga de donde venga', () => {
    for (const pathname of ['/home', '/check-email', '/login', '/merchants']) {
      expect(pendingScanStep(ctx({ pathname }))).toBe('resume')
    }
  })

  it('si el escáner ya lo tiene, no se vuelve a lanzar', () => {
    expect(pendingScanStep(ctx({ pathname: '/scanner' }))).toBe('wait')
    expect(pendingScanStep(ctx({ pathname: '/scanner/success' }))).toBe('wait')
  })

  it('no decide nada mientras la app arranca', () => {
    expect(pendingScanStep(ctx({ ready: false }))).toBe('wait')
  })

  it('caduca a las dos horas', () => {
    const old = { code: 'abc123', at: NOW - PENDING_SCAN_TTL_MS }
    expect(isPendingScanFresh(old, NOW)).toBe(false)
    expect(pendingScanStep(ctx({ pending: old }))).toBe('expired')
    expect(isPendingScanFresh(pending, NOW)).toBe(true)
    // Un reloj atrasado no lo da por bueno para siempre.
    expect(isPendingScanFresh({ code: 'x', at: NOW + 1000 }, NOW)).toBe(false)
  })

  it('la ruta del escáner lleva el código tal cual llegó', () => {
    expect(scannerPathFor('abc123')).toBe('/scanner?c=abc123')
    expect(scannerPathFor('a b&c')).toBe('/scanner?c=a%20b%26c')
  })
})

describe('el almacén guarda el escaneo pendiente', () => {
  beforeEach(() => {
    useAppStore.getState().clearLocalSetup()
  })

  it('sobrevive a cerrar sesión y se borra al empezar de cero', () => {
    const store = useAppStore.getState()
    store.setPendingScan(pending)
    store.signOut()
    expect(useAppStore.getState().pendingScan).toEqual(pending)
    store.clearLocalSetup()
    expect(useAppStore.getState().pendingScan).toBeNull()
  })
})
