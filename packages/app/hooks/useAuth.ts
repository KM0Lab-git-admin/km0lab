import { useAppStore } from '../stores/useAppStore'

/**
 * useAuth — Sesión del usuario (Zustand).
 *
 * Antes vivía en `services/mock/auth` + listeners propios; ahora es
 * un selector fino sobre el store global. La firma se mantiene para no
 * tocar las pantallas. Los tipos MockSession/MockUser se exportan desde
 * `services/mock/auth` (evita duplicar el nombre en el barrel de @km0lab/app).
 */
export const useAuth = () => {
  const session = useAppStore((s) => s.session)
  const signOutAction = useAppStore((s) => s.signOut)

  return {
    session,
    user: session?.user ?? null,
    // Con Zustand+persist el estado se hidrata sincronamente desde
    // localStorage en el primer render → ya no hay "loading" inicial.
    loading: false,
    signOut: async () => {
      signOutAction()
    },
  }
}
