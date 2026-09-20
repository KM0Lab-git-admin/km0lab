import { useEffect, useState } from 'react'

import { getMyInviteSummary } from '../services/invites'
import { useAppStore } from '../stores/useAppStore'
import type { InvitationsSummary } from '../types/invitation'

const EMPTY: InvitationsSummary = {
  personsRegistered: 0,
  businessesRegistered: 0,
  pointsEarned: 0,
  pointsPending: 0,
}

export function useInviteSummary(): {
  summary: InvitationsSummary
  loading: boolean
  error: string | null
} {
  const token = useAppStore((s) => s.token)
  const [summary, setSummary] = useState<InvitationsSummary>(EMPTY)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setSummary(EMPTY)
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getMyInviteSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((e) => {
        if (!cancelled) {
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
  }, [token])

  return { summary, loading, error }
}
