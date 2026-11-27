import { useEffect } from 'react'

import { apiFetch, userSchema } from '../services/km0labClient'
import { useAppStore } from '../stores/useAppStore'

/** Avoid parallel /users/me probes from every screen that calls useAuth. */
let sessionProbe = false

/**
 * useAuth — Sesión del usuario (Zustand).
 *
 * Antes vivía en `services/mock/auth` + listeners propios; ahora es
 * un selector fino sobre el store global. La firma se mantiene para no
 * tocar las pantallas.
 *
 * Si hay JWT en storage, lo valida una vez contra GET /users/me. Token
 * caducado o de un usuario ya no existente → signOut silencioso (guest).
 */
export const useAuth = () => {
  const session = useAppStore((s) => s.session)
  const token = useAppStore((s) => s.token)
  const signOutAction = useAppStore((s) => s.signOut)
  const clearLocalSetup = useAppStore((s) => s.clearLocalSetup)

  useEffect(() => {
    if (!token) {
      sessionProbe = false
      return
    }
    if (sessionProbe) return
    sessionProbe = true
    apiFetch('/users/me', { schema: userSchema, auth: true }).catch(() => {
      /* 401 limpia el store en apiFetch */
    })
  }, [token])

  return {
    session,
    user: session?.user ?? null,
    // Con Zustand+persist el estado se hidrata sincronamente desde
    // localStorage en el primer render → ya no hay "loading" inicial.
    loading: false,
    signOut: async () => {
      signOutAction()
    },
    /** Guest: borra idioma/CP/sesión local (vuelve al Language). */
    resetDeviceSetup: async () => {
      clearLocalSetup()
    },
  }
}
