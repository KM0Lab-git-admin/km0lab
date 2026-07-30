import { useCallback, useEffect, useState } from 'react'

import { getPublicTown } from '../services/towns'
import { useAppStore } from '../stores/useAppStore'

import type { TownPublicOut } from '../services/km0labClient'

/**
 * usePublicTown — reglas públicas del municipio.
 * GET /towns/public?postal_code
 */
export function usePublicTown(): {
  town: TownPublicOut | null
  /** Puntos por escaneo QR (town.default_visit_points). */
  visitPoints: number
  loading: boolean
  error: string | null
  reload: () => void
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const [town, setTown] = useState<TownPublicOut | null>(null)
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!postalCode) {
      setTown(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getPublicTown(postalCode)
      .then((row) => {
        if (!cancelled) setTown(row)
      })
      .catch((e) => {
        if (!cancelled) {
          setTown(null)
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postalCode, tick])

  return {
    town,
    visitPoints: town?.default_visit_points ?? 10,
    loading,
    error,
    reload,
  }
}
