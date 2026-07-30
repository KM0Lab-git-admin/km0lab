import { useEffect, useState } from 'react'

import { listMyPointsHistory } from '../services/points'
import { useAppStore } from '../stores/useAppStore'
import { toPointsTransaction } from '../utils/pointsHistoryMapper'

import type { PointsHistorySummary } from '../types/points'

/**
 * usePointsHistory — ledger del usuario autenticado.
 * GET /points/me/history (Bearer). Sin token → vacío.
 */
export function usePointsHistory(): {
  history: PointsHistorySummary
  loading: boolean
  error: string | null
} {
  const token = useAppStore((s) => s.token)
  const setUserPoints = useAppStore((s) => s.setUserPoints)
  const [history, setHistory] = useState<PointsHistorySummary>({
    balance: 0,
    earnedTotal: 0,
    spentTotal: 0,
    items: [],
  })
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setHistory({ balance: 0, earnedTotal: 0, spentTotal: 0, items: [] })
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    listMyPointsHistory()
      .then((res) => {
        if (cancelled) return
        setHistory({
          balance: res.balance,
          earnedTotal: res.earned_total,
          spentTotal: res.spent_total,
          items: res.items.map(toPointsTransaction),
        })
        setUserPoints(res.balance)
      })
      .catch((e) => {
        if (!cancelled) {
          setHistory({ balance: 0, earnedTotal: 0, spentTotal: 0, items: [] })
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, setUserPoints])

  return { history, loading, error }
}
