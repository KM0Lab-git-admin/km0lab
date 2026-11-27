/**
 * Entrar con código: cada fallo tiene su motivo y su mensaje. Antes todo
 * era «código incorrecto», también el código caducado o la falta de red.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { otpErrorKey, otpErrorKind, requestOtp } from '../services/auth'
import { ApiError } from '../services/km0labClient'
import { useAppStore } from '../stores/useAppStore'
import { t } from '../utils/i18nProd'

import { mockApi } from './helpers'

import type { OtpErrorKind } from '../services/auth'

const api = (status: number, code?: string) =>
  new ApiError(status, code ?? `HTTP ${status}`, code ? { code } : undefined)

describe('motivo del fallo al entrar', () => {
  it('lee el motivo que manda el servidor', () => {
    expect(otpErrorKind(api(400, 'otp_invalid'))).toBe('wrong')
    expect(otpErrorKind(api(400, 'otp_expired'))).toBe('expired')
    expect(otpErrorKind(api(400, 'otp_too_many_attempts'))).toBe('too_many')
    expect(otpErrorKind(api(503, 'otp_send_failed'))).toBe('send_failed')
  })

  it('el límite de peticiones es «demasiados intentos»', () => {
    expect(otpErrorKind(api(429))).toBe('too_many')
  })

  it('un servidor antiguo que solo dice 400 sigue siendo «código incorrecto»', () => {
    expect(
      otpErrorKind(new ApiError(400, 'Codi invàlid o caducat', 'Codi invàlid'))
    ).toBe('wrong')
  })

  it('sin red no se culpa al código', () => {
    expect(otpErrorKind(new TypeError('Failed to fetch'))).toBe('offline')
  })

  it('lo que no se reconoce no se disfraza de otra cosa', () => {
    expect(otpErrorKind(api(500))).toBe('unknown')
    expect(otpErrorKind(new Error('boom'))).toBe('unknown')
  })

  it('cada motivo tiene texto propio en los tres idiomas', () => {
    const kinds: OtpErrorKind[] = [
      'wrong',
      'expired',
      'too_many',
      'offline',
      'send_failed',
      'unknown',
    ]
    for (const lang of ['ca', 'es', 'en'] as const) {
      const texts = kinds.map((kind) => t(otpErrorKey(kind), lang))
      expect(texts.every((text) => text.length > 10)).toBe(true)
      expect(new Set(texts).size).toBe(kinds.length)
    }
  })
})

describe('pedir el código', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lo pide en el idioma de la app, para que el correo llegue en ese idioma', async () => {
    useAppStore.setState({ lang: 'ca' })
    const { first } = mockApi({
      'POST /auth/request-otp': { json: { message: 'ok' } },
    })

    const { error } = await requestOtp(' veina@example.com ')

    expect(error).toBeNull()
    expect(first().body).toMatchObject({
      email: 'veina@example.com',
      lang: 'ca',
    })
  })

  it('si el correo no se pudo enviar, lo dice', async () => {
    mockApi({
      'POST /auth/request-otp': {
        status: 503,
        json: { detail: { code: 'otp_send_failed', message: 'x' } },
      },
    })
    const { error } = await requestOtp('veina@example.com')
    expect(error?.kind).toBe('send_failed')
  })

  it('sin red, lo dice', async () => {
    mockApi({ 'POST /auth/request-otp': new TypeError('Failed to fetch') })
    const { error } = await requestOtp('veina@example.com')
    expect(error?.kind).toBe('offline')
  })
})

describe('texto de «ya has visitado este comercio»', () => {
  it('dice desde cuándo se puede volver a sumar, no «una sola vez»', () => {
    for (const lang of ['ca', 'es', 'en'] as const) {
      const text = t('scanner.error.ja_visitat.subtitle', lang)
      expect(text).toContain('{data}')
      expect(text).toContain('{nom}')
      expect(text).not.toMatch(/un sol cop|una sola vez|only once/)
    }
  })
})
