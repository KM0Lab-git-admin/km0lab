import { useEffect } from 'react'

import { apiFetch, userSchema } from '../services/km0labClient'
import { useAppStore } from '../stores/useAppStore'

/**
 * useUserPoints — saldo de puntos del usuario autenticado.
 *
 * Lee `session.user.points` del store y, si hay token, refresca desde
 * GET /users/me al montar / cambiar de sesión.
 */
export function useUserPoints(): {
  points: number
  setPoints: (n: number) => void
} {
  const token = useAppStore((s) => s.token)
  const points = useAppStore((s) => s.session?.user.points ?? 0)
  const setUserPoints = useAppStore((s) => s.setUserPoints)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    apiFetch('/users/me', { schema: userSchema, auth: true })
      .then((u) => {
        if (!cancelled) setUserPoints(u.points ?? 0)
      })
      .catch(() => {
        /* saldo local se mantiene */
      })
    return () => {
      cancelled = true
    }
  }, [token, setUserPoints])

  return { points, setPoints: setUserPoints }
}
