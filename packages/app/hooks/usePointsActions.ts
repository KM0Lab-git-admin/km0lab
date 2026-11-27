import { useCallback, useEffect, useState } from 'react'

import { listMyPointsHistory, listPublicActions } from '../services/points'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { toPointAction, withCompletedActions } from '../utils/pointActionMapper'

import type { PointAction } from '../types/points'

/**
 * usePointsActions — catálogo completo de acciones (pantalla /points-actions).
 *
 * Llama a GET /actions/public?postal_code={cp}&lang={lang} (sin visible_home:
 * todas las activas del municipio). Sin CP no hace fetch. El endpoint traduce
 * name/description según lang; el chip de tipo sigue por i18n local.
 * Si hay JWT, cruza el ledger (`/points/me/history`) para marcar
 * completadas las acciones que ya han pagado puntos (alta, invitaciones…).
 * Con CP demo (00000) pasa demo=true para pedir la partición is_fake.
 */

export function usePointsActions(): {
  actions: PointAction[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const token = useAppStore((s) => s.token)
  const [actions, setActions] = useState<PointAction[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!postalCode) {
      setActions([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const load = async () => {
      const rows = await listPublicActions(postalCode, {
        lang,
        demo: isDemoPostalCode(postalCode),
      })
      const mapped = rows.map(toPointAction)
      if (!token) return mapped
      try {
        const history = await listMyPointsHistory()
        return withCompletedActions(mapped, history.items)
      } catch {
        return mapped
      }
    }

    load()
      .then((next) => {
        if (cancelled) return
        setActions(next)
      })
      .catch((e) => {
        if (!cancelled) {
          setActions([])
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postalCode, lang, token, tick])

  return { actions, loading, error, reload }
}
