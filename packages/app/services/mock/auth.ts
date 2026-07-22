/**
 * Mock de autenticación (fase de maquetación).
 *
 * Las funciones mantienen la firma para que el porte al backend real
 * (Twilio + Railway) sea solo un cambio de implementación. El estado
 * vive en `useAppStore` (Zustand), no en localStorage directamente.
 *
 *  - `requestOtp(email, metadata)`: registra pendingOtp.
 *  - `verifyOtp(email, code)`: acepta cualquier código de 4 dígitos,
 *    crea sesión y siembra el perfil.
 *  - `signOut()`: limpia sesión.
 *  - `getSession()` / `onAuthChange()`: utilitarios legacy basados en
 *    el store; preferir `useAuth()` en componentes.
 */
import {
  useAppStore,
  ensureProfileSeed,
  type AppSession,
  type AppUser,
} from '../../stores/useAppStore'

export type MockUser = AppUser
export type MockSession = AppSession

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
): Promise<{ error: { message: string } | null }> => {
  const trimmed = email.trim()
  if (!trimmed) return { error: { message: 'Email requerido' } }
  useAppStore.getState().setPendingOtp({ email: trimmed, ...metadata })
  await new Promise((r) => setTimeout(r, 250))
  return { error: null }
}

export const verifyOtp = async (
  email: string,
  code: string
): Promise<{ error: { message: string } | null }> => {
  if (!/^\d{4}$/.test(code)) return { error: { message: 'Código no válido' } }
  await new Promise((r) => setTimeout(r, 200))

  const store = useAppStore.getState()
  const pending = store.pendingOtp

  const session: MockSession = {
    user: {
      id: `mock-${btoa(email).replace(/=/g, '')}`,
      email: email.trim(),
    },
    createdAt: new Date().toISOString(),
  }

  store.setSession(session)
  store.setPendingOtp(null)
  ensureProfileSeed(session.user, {
    postal_code: pending?.postal_code,
    town: pending?.town,
  })
  return { error: null }
}

export const signOut = async (): Promise<void> => {
  useAppStore.getState().signOut()
}
