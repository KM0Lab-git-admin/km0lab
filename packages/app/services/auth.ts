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

import {
  apiFetch,
  ApiError,
  authSchema,
  messageSchema,
  userSchema,
} from './km0labClient'

export type MockUser = AppUser
export type MockSession = AppSession

type Result = { error: { message: string } | null }

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
  metadata?: { postal_code?: string; town?: string }
): Promise<Result> => {
  const trimmed = email.trim()
  if (!trimmed) return { error: { message: 'Email requerido' } }
  try {
    await apiFetch('/auth/request-otp', {
      method: 'POST',
      body: { email: trimmed },
      schema: messageSchema,
    })
    useAppStore.getState().setPendingOtp({ email: trimmed, ...metadata })
    return { error: null }
  } catch (e) {
    return { error: { message: toMessage(e, 'No se pudo enviar el código') } }
  }
}

export const verifyOtp = async (
  email: string,
  code: string
): Promise<Result> => {
  try {
    const auth = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: { email: email.trim(), code },
      schema: authSchema,
    })
    const store = useAppStore.getState()
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
    store.setPendingOtp(null)
    return { error: null }
  } catch (e) {
    return { error: { message: toMessage(e, 'Código no válido') } }
  }
}

export const signOut = async (): Promise<void> => {
  useAppStore.getState().signOut()
}
