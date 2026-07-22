/**
 * Servicio de autenticación real (km0lab-api).
 *
 * Sustituye a `services/mock/auth`. Mantiene las mismas firmas para no tocar
 * las pantallas (Login, CheckEmail). Flujo OTP por email + JWT:
 *  - `requestOtp(email, metadata)`: pide el código; guarda `pendingOtp` con
 *    metadata (CP/town de onboarding) para sembrar el perfil tras verificar.
 *  - `verifyOtp(email, code)`: valida; guarda JWT + sesión + perfil en el store.
 *  - `signOut()`: limpia sesión y token.
 *  - `getSession()` / `onAuthChange()`: utilitarios legacy sobre el store.
 */
import {
  useAppStore,
  type AppSession,
  type AppUser,
} from '../stores/useAppStore'

import { apiFetch, ApiError, authSchema, messageSchema } from './km0labClient'

export type MockUser = AppUser
export type MockSession = AppSession

type Result = { error: { message: string } | null }

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
      user: { id: auth.user.id, email: auth.user.email },
      createdAt: new Date().toISOString(),
    })
    // Siembra el perfil con los datos del backend; el `name` (único en la API)
    // se coloca en first_name (last_name queda local).
    store.upsertProfile(auth.user.id, {
      first_name: auth.user.name,
      last_name: null,
      email: auth.user.email,
      postal_code:
        auth.user.postal_code ?? store.pendingOtp?.postal_code ?? null,
      town: auth.user.town ?? store.pendingOtp?.town ?? null,
      avatar_url: null,
    })
    store.setPendingOtp(null)
    return { error: null }
  } catch (e) {
    return { error: { message: toMessage(e, 'Código no válido') } }
  }
}

export const signOut = async (): Promise<void> => {
  useAppStore.getState().signOut()
}
