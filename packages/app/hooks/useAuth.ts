import { useEffect } from 'react'

import { keepSessionAlive } from '../services/auth'
import { useAppStore } from '../stores/useAppStore'

/**
 * useAuth — Sesión del usuario (Zustand).
 *
 * Antes vivía en `services/mock/auth` + listeners propios; ahora es
 * un selector fino sobre el store global. La firma se mantiene para no
 * tocar las pantallas.
 *
 * Si hay sesión guardada, la renueva en silencio al abrir la App (como
 * mucho una vez al día): así quien la usa no vuelve a identificarse. Si el
 * servidor contesta que la sesión ya no vale (caducada tras un año sin
 * uso, cerrada desde el servidor o cuenta borrada) → signOut silencioso
 * (guest). Sin conexión no pasa nada: se sigue con la sesión que hay.
 */
export const useAuth = () => {
  const session = useAppStore((s) => s.session)
  const token = useAppStore((s) => s.token)
  const signOutAction = useAppStore((s) => s.signOut)
  const clearLocalSetup = useAppStore((s) => s.clearLocalSetup)

  useEffect(() => {
    if (token) keepSessionAlive()
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
