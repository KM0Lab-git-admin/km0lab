import { useCallback, useEffect, useState } from 'react'

import { getMyInviteLink } from '../services/invites'
import { useAppStore } from '../stores/useAppStore'
import { getCanonicalWebLink, getShareLink } from '../utils/shareUrl'

export interface InviteLinkResult {
  link: string | null
  /** El código del que invita: el mismo que lleva el enlace, para dictarlo. */
  code: string | null
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * useInviteLink — enlace que comparte el vecino.
 *
 * Costura con Lovable. Con sesión, el código lo emite el servidor
 * (`GET /invites/me/link`) y el enlace es `/i/{código}`, el único que
 * permite atribuir el registro. Sin sesión se comparte el enlace genérico
 * de la app, que no da puntos. Solo se invita a amigos: la invitación a
 * negocios está apagada en el piloto.
 */
export function useInviteLink(): InviteLinkResult {
  const kind = 'person'
  const token = useAppStore((s) => s.token)
  const town = useAppStore((s) => s.town)
  const lang = useAppStore((s) => s.lang)
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!token) {
      setCode(null)
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getMyInviteLink(kind)
      .then((row) => {
        if (!cancelled) setCode(row.public_code)
      })
      .catch((e) => {
        if (!cancelled) {
          setCode(null)
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, tick])

  const link = !token
    ? getShareLink('/home', { town, lang })
    : code
      ? getCanonicalWebLink(`/i/${code}`, { town, lang, invite: kind })
      : null

  return { link, code: token ? code : null, loading, error, reload }
}
