import { useCallback, useEffect, useState } from 'react'

import { getProfile } from '../services/profile'
import { useAppStore } from '../stores/useAppStore'

/**
 * useProfile — perfil del vecino con sesión.
 *
 * Costura con Lovable (`src/hooks/useProfile.ts`, que allí solo lee su
 * almacén local). En producción el almacén se rellena al entrar y, además,
 * se vuelve a pedir al servidor al abrir la pantalla: así lo que se ve es
 * lo que hay guardado, también si se cambió desde otro dispositivo.
 *
 * Sin sesión devuelve `{ profile: null }`. Mientras llega la respuesta se
 * enseña lo que ya había en el almacén; solo «carga» si no había nada.
 */
export interface Profile {
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  birth_date: string | null
  postal_code: string | null
  town: string | null
  avatar_url: string | null
}

export const useProfile = () => {
  const userId = useAppStore((s) => s.session?.user.id ?? null)
  const profile = useAppStore((s) =>
    userId ? (s.profiles[userId] ?? null) : null
  )
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    if (!userId) return
    setPending(true)
    setError(null)
    void getProfile(userId).then((fresh) => {
      setError(fresh ? null : 'profile_error')
      setPending(false)
    })
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    profile: profile as Profile | null,
    loading: pending && profile === null,
    // Con datos en pantalla, un fallo al refrescar no la sustituye por un error.
    error: profile === null ? error : null,
    reload,
    refetch: reload,
  }
}
