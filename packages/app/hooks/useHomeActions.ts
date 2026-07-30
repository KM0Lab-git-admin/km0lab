import { useEffect, useState } from 'react'

import { listPublicActions } from '../services/points'
import { useAppStore } from '../stores/useAppStore'
import { toPointAction } from '../utils/pointActionMapper'

import type { PointAction } from '../types/points'

/**
 * useHomeActions — acciones del strip «Com guanyar punts avui».
 *
 * Llama a GET /actions/public?postal_code={cp}&visible_home=true&lang={lang}
 * usando CP e idioma del store. Sin CP no hace fetch. El endpoint traduce
 * name/description según lang; el chip de tipo sigue por i18n local.
 */

export function useHomeActions(): {
  actions: PointAction[]
  loading: boolean
  error: string | null
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const [actions, setActions] = useState<PointAction[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)

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

    listPublicActions(postalCode, { visibleHome: true, lang })
      .then((rows) => {
        if (cancelled) return
        setActions(rows.map(toPointAction))
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
  }, [postalCode, lang])

  return { actions, loading, error }
}
