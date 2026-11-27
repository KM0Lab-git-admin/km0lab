import { useCallback, useEffect, useState } from 'react'

import { getMyInviteSummary, listMyConversions } from '../services/invites'
import { useAppStore } from '../stores/useAppStore'

import { useInviteRewards } from './useInviteRewards'

import type { InvitationRecord, InvitationsSummary } from '../types/invitation'

/** Sin sesión, o mientras llega la respuesta: nada ganado todavía. */
const empty = (friendLimit: number): InvitationsSummary => ({
  personsRegistered: 0,
  pointsEarned: 0,
  pointsPending: 0,
  friendLimit,
})

/**
 * useInvitations — registros atribuidos a las invitaciones del vecino y su
 * resumen. Costura con Lovable; aquí salen de `GET /invites/me/conversions`
 * y `GET /invites/me/summary`. La atribución y los puntos los decide el
 * servidor.
 */
export function useInvitations(): {
  records: InvitationRecord[]
  summary: InvitationsSummary
  loading: boolean
  error: string | null
  reload: () => void
} {
  const token = useAppStore((s) => s.token)
  const [records, setRecords] = useState<InvitationRecord[]>([])
  // El tope general del municipio vale hasta que el servidor dice el de
  // esta persona; sin sesión es el único que hay.
  const { friendLimit } = useInviteRewards()
  const [own, setOwn] = useState<InvitationsSummary | null>(null)
  const summary = own ?? empty(friendLimit)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!token) {
      setRecords([])
      setOwn(null)
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([listMyConversions(), getMyInviteSummary()])
      .then(([rows, totals]) => {
        if (cancelled) return
        setRecords(rows)
        setOwn(totals)
      })
      .catch((e) => {
        if (!cancelled) {
          setRecords([])
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
  }, [token, tick])

  return { records, summary, loading, error, reload }
}
