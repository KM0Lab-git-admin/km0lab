import { useEffect, useState } from 'react'

import { getMyInviteSummary } from '../services/invites'
import { useAppStore } from '../stores/useAppStore'

import { useInviteRewards } from './useInviteRewards'

import type { InvitationsSummary } from '../types/invitation'

/** Sin sesión, o mientras llega la respuesta: nada ganado todavía. */
const empty = (friendLimit: number): InvitationsSummary => ({
  personsRegistered: 0,
  pointsEarned: 0,
  pointsPending: 0,
  friendLimit,
})

export function useInviteSummary(): {
  summary: InvitationsSummary
  loading: boolean
  error: string | null
} {
  const token = useAppStore((s) => s.token)
  // El tope general del municipio vale hasta que el servidor dice el de
  // esta persona; sin sesión es el único que hay.
  const { friendLimit } = useInviteRewards()
  const [own, setOwn] = useState<InvitationsSummary | null>(null)
  const summary = own ?? empty(friendLimit)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setOwn(null)
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getMyInviteSummary()
      .then((data) => {
        if (!cancelled) setOwn(data)
      })
      .catch((e) => {
        if (!cancelled) {
          setOwn(null)
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return { summary, loading, error }
}
