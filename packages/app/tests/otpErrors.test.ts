/**
 * Entrar con código: cada fallo tiene su motivo y su mensaje. Antes todo
 * era «código incorrecto», también el código caducado o la falta de red.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  otpErrorKey,
  otpErrorKind,
  otpErrorText,
  otpRetryMinutes,
  requestOtp,
} from '../services/auth'
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

describe('«demasiados intentos» dice cuándo volver a probar', () => {
  const limited = (seconds: unknown) =>
    new ApiError(429, 'Massa intents', {
      code: 'rate_limited',
      retry_after_seconds: seconds,
    })

  it('lee la espera que manda el servidor, en minutos enteros', () => {
    expect(otpRetryMinutes(limited(3600))).toBe(60)
    expect(otpRetryMinutes(limited(61))).toBe(2)
    expect(otpRetryMinutes(limited(5))).toBe(1)
  })

  it('sin ese dato no inventa una espera', () => {
    expect(otpRetryMinutes(limited(undefined))).toBeUndefined()
    expect(otpRetryMinutes(limited(0))).toBeUndefined()
    expect(
      otpRetryMinutes(new ApiError(429, 'Too Many Requests'))
    ).toBeUndefined()
    expect(otpRetryMinutes(new TypeError('Failed to fetch'))).toBeUndefined()
  })

  it('el aviso lleva los minutos en los tres idiomas', () => {
    const error = { kind: 'too_many' as const, retryMinutes: 20 }
    expect(otpErrorText(error, 'ca')).toContain('20 min')
    expect(otpErrorText(error, 'es')).toContain('20 min')
    expect(otpErrorText(error, 'en')).toContain('20 min')
    // Sin el dato (servidor antiguo, o intentos agotados de un código), el de siempre.
    expect(otpErrorText({ kind: 'too_many' }, 'es')).toBe(
      t('otp.toast_too_many', 'es')
    )
    expect(otpErrorText({ kind: 'expired' }, 'ca')).toBe(
      t('otp.toast_expired', 'ca')
    )
  })

  it('pedir un código con el límite alcanzado trae la espera', async () => {
    useAppStore.setState({ lang: 'ca' })
    mockApi({
      'POST /auth/request-otp': {
        status: 429,
        json: {
          detail: {
            code: 'otp_email_limit',
            message: 'Massa intents.',
            retry_after_seconds: 1200,
          },
        },
      },
    })
    const { error } = await requestOtp('marta@example.com')
    expect(error?.kind).toBe('too_many')
    expect(error?.retryMinutes).toBe(20)
  })
})
