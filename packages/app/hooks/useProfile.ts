import { useAppStore } from '../stores/useAppStore'

/**
 * useProfile — Perfil del usuario actual (Zustand).
 *
 * Sin sesión devuelve `{ profile: null }`. Reactivo: cualquier cambio
 * en el store re-renderiza los consumidores.
 */
export interface Profile {
  first_name: string | null
  last_name: string | null
  email: string | null
  postal_code: string | null
  town: string | null
  avatar_url: string | null
}

export const useProfile = () => {
  const userId = useAppStore((s) => s.session?.user.id ?? null)
  const profile = useAppStore((s) =>
    userId ? (s.profiles[userId] ?? null) : null
  )

  return {
    profile: profile as Profile | null,
    loading: false,
    refetch: () => {
      /* no-op: el store es la fuente de verdad */
    },
  }
}
