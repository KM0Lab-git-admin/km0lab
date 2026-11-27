/**
 * Servicio de autenticación real (km0lab-api).
 *
 * Sustituye a `services/mock/auth`. Mantiene las mismas firmas para no tocar
 * las pantallas (Login, CheckEmail). Flujo OTP por email + JWT:
 *  - `requestOtp(email, metadata)`: pide el código; guarda `pendingOtp` con
 *    metadata (CP/town de onboarding) para sembrar el perfil tras verificar.
 *  - `verifyOtp(email, code)`: valida; guarda JWT + sesión + perfil; sincroniza
 *    lang/CP/town locales a la BD con PATCH /users/me.
 *  - `signOut()`: limpia sesión y token (mantiene setup local).
 *  - `getSession()` / `onAuthChange()`: utilitarios legacy sobre el store.
 */
import {
  useAppStore,
  type AppSession,
  type AppUser,
} from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { clearPendingInvite, currentInviteCode } from '../utils/pendingInvite'

import {
  apiFetch,
  ApiError,
  authSchema,
  messageSchema,
  userSchema,
} from './km0labClient'

import type { TKey } from '../utils/i18nProd'

export type MockUser = AppUser
export type MockSession = AppSession

/** Por qué no se pudo pedir o validar el código. */
export type OtpErrorKind =
  | 'wrong'
  | 'expired'
  | 'too_many'
  | 'offline'
  | 'send_failed'
  | 'unknown'

type Result = { error: { message: string; kind: OtpErrorKind } | null }

/**
 * Lo que pasó con la cuenta al entrar, cuando no es lo que la persona
 * esperaba. Una cuenta no cruza entre la demostración y un pueblo real con
 * sus puntos (lo decide el servidor):
 * - `account_is_real`: entró estando en la demostración con una cuenta de
 *   un pueblo real. La cuenta se queda en su pueblo y la app la lleva allí.
 * - `left_demo`: entró desde un pueblo real con una cuenta de demostración.
 *   Pasa a ser vecina de ese pueblo, con el saldo a cero.
 */
export type SideNotice = {
  kind: 'account_is_real' | 'left_demo'
  town: string
}
type VerifyResult = Result & { notice?: SideNotice }

/** Compara dónde estaba la cuenta y la app con dónde ha quedado la cuenta. */
export const sideNoticeFor = (
  before: { accountPostalCode: string | null; appPostalCode: string | null },
  after: { postalCode: string | null; town: string | null }
): SideNotice | undefined => {
  if (!after.postalCode || isDemoPostalCode(after.postalCode)) return undefined
  const town = after.town ?? ''
  if (isDemoPostalCode(before.accountPostalCode)) {
    return { kind: 'left_demo', town }
  }
  if (isDemoPostalCode(before.appPostalCode)) {
    return { kind: 'account_is_real', town }
  }
  return undefined
}

/**
 * Traduce el fallo a su motivo. El servidor lo dice en `detail.code`
 * (`otp_invalid`, `otp_expired`, `otp_too_many_attempts`,
 * `otp_send_failed`); el límite de peticiones llega como 429 y la falta de
 * red como un `TypeError` de `fetch`.
 */
export const otpErrorKind = (e: unknown): OtpErrorKind => {
  if (e instanceof TypeError) return 'offline'
  if (!(e instanceof ApiError)) return 'unknown'
  if (e.status === 429) return 'too_many'
  const code =
    e.detail && typeof e.detail === 'object'
      ? (e.detail as { code?: unknown }).code
      : undefined
  if (code === 'otp_expired') return 'expired'
  if (code === 'otp_too_many_attempts') return 'too_many'
  if (code === 'otp_send_failed') return 'send_failed'
  if (e.status === 400) return 'wrong'
  return 'unknown'
}

const OTP_ERROR_KEYS: Record<OtpErrorKind, TKey> = {
  wrong: 'otp.toast_wrong',
  expired: 'otp.toast_expired',
  too_many: 'otp.toast_too_many',
  offline: 'otp.toast_offline',
  send_failed: 'otp.toast_send_failed',
  unknown: 'otp.toast_error',
}

/** Clave del texto que explica ese motivo al vecino. */
export const otpErrorKey = (kind: OtpErrorKind): TKey => OTP_ERROR_KEYS[kind]

const PENDING_REWARD_KEY = 'km0_pending_reward'

export type PendingReward = {
  points: number
  message: string | null
}

export const readPendingReward = (): PendingReward | null => {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(PENDING_REWARD_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PendingReward
    if (typeof parsed.points === 'number' && parsed.points > 0) return parsed
  } catch {
    // ignore
  }
  return null
}

export const clearPendingReward = (): void => {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(PENDING_REWARD_KEY)
}

const stashPendingReward = (points: number, message: string | null): void => {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(
    PENDING_REWARD_KEY,
    JSON.stringify({ points, message })
  )
}

const toMessage = (e: unknown, fallback: string): string =>
  e instanceof ApiError ? e.message : fallback

export const getSession = (): MockSession | null =>
  useAppStore.getState().session

export const onAuthChange = (
  cb: (s: MockSession | null) => void
): (() => void) => {
  return useAppStore.subscribe((state, prev) => {
    if (state.session !== prev.session) cb(state.session)
  })
}

export const requestOtp = async (
  email: string,
  metadata?: {
    postal_code?: string
    town?: string
    invite_code?: string
  }
): Promise<Result> => {
  const trimmed = email.trim()
  if (!trimmed) {
    return { error: { message: 'Email requerido', kind: 'unknown' } }
  }
  try {
    const inviteCode =
      metadata?.invite_code?.trim() || currentInviteCode() || undefined
    await apiFetch('/auth/request-otp', {
      method: 'POST',
      body: {
        email: trimmed,
        // El correo del código llega en el idioma de la app; sin esto, a
        // quien se da de alta le llegaba siempre en castellano.
        lang: useAppStore.getState().lang,
        postal_code: metadata?.postal_code,
        invite_code: inviteCode,
      },
      schema: messageSchema,
    })
    useAppStore.getState().setPendingOtp({ email: trimmed, ...metadata })
    return { error: null }
  } catch (e) {
    return {
      error: {
        message: toMessage(e, 'No se pudo enviar el código'),
        kind: otpErrorKind(e),
      },
    }
  }
}

export const verifyOtp = async (
  email: string,
  code: string
): Promise<VerifyResult> => {
  try {
    const store = useAppStore.getState()
    const inviteCode = currentInviteCode()
    const auth = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: {
        email: email.trim(),
        code,
        invite_code: inviteCode,
        postal_code: store.postalCode ?? store.pendingOtp?.postal_code,
      },
      schema: authSchema,
    })
    store.setToken(auth.access_token)
    store.setSession({
      user: {
        id: auth.user.id,
        email: auth.user.email,
        points: auth.user.points ?? 0,
      },
      createdAt: new Date().toISOString(),
    })

    if (auth.points_awarded && auth.points_awarded > 0) {
      stashPendingReward(auth.points_awarded, auth.points_award_message ?? null)
    }

    const postal =
      store.postalCode ??
      store.pendingOtp?.postal_code ??
      auth.user.postal_code ??
      null
    const town = store.town ?? store.pendingOtp?.town ?? auth.user.town ?? null

    // Sincroniza preferencias locales del dispositivo a la BD.
    let user = auth.user
    try {
      user = await apiFetch('/users/me', {
        method: 'PATCH',
        auth: true,
        body: {
          lang: store.lang,
          postal_code: postal,
        },
        schema: userSchema,
      })
    } catch {
      // Si el PATCH falla, seguimos con lo que devolvió verify-otp.
    }

    store.setUserPoints(user.points ?? 0)
    store.upsertProfile(user.id, {
      first_name: user.first_name ?? user.name,
      last_name: user.last_name ?? null,
      email: user.email,
      phone: user.phone ?? null,
      birth_date: user.birth_date ?? null,
      postal_code: user.postal_code ?? postal,
      town: user.town ?? town,
      avatar_url: null,
    })
    if (user.lang === 'ca' || user.lang === 'es' || user.lang === 'en') {
      store.setLang(user.lang)
    }
    if (user.postal_code || user.town) {
      store.setLocation(user.postal_code ?? postal, user.town ?? town)
    }
    // La cuenta manda: si es de un pueblo real, la app sale de la
    // demostración aunque se entrara desde ella.
    const notice = sideNoticeFor(
      {
        accountPostalCode: auth.user.postal_code ?? null,
        appPostalCode: postal,
      },
      { postalCode: user.postal_code ?? null, town: user.town ?? null }
    )
    if (user.postal_code && !isDemoPostalCode(user.postal_code)) {
      store.setShowcase(null)
    }
    store.setPendingOtp(null)
    clearPendingInvite()
    return { error: null, notice }
  } catch (e) {
    return {
      error: {
        message: toMessage(e, 'Código no válido'),
        kind: otpErrorKind(e),
      },
    }
  }
}

export const signOut = async (): Promise<void> => {
  useAppStore.getState().signOut()
}
