import { useCallback, useEffect, useState } from 'react'

import { getMyInviteSummary, listMyConversions } from '../services/invites'
import { useAppStore } from '../stores/useAppStore'

import type { InvitationRecord, InvitationsSummary } from '../types/invitation'

const EMPTY: InvitationsSummary = {
  personsRegistered: 0,
  businessesRegistered: 0,
  pointsEarned: 0,
  pointsPending: 0,
}

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
  const [summary, setSummary] = useState<InvitationsSummary>(EMPTY)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!token) {
      setRecords([])
      setSummary(EMPTY)
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
        setSummary(totals)
      })
      .catch((e) => {
        if (!cancelled) {
          setRecords([])
          setSummary(EMPTY)
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
