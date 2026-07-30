import { useEffect, useState } from 'react'

import { listPublicRewards } from '../services/rewards'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { toReward } from '../utils/rewardMapper'

import type { Reward } from '../types/reward'

/**
 * useHomeRewards — catálogo de premios del carrusel Home.
 *
 * Llama a GET /rewards/public?postal_code={cp}&lang={lang}
 * usando CP e idioma del store. Sin CP no hace fetch. El endpoint traduce
 * name/description/conditions según lang; la imagen se resuelve vía
 * image_url → URL absoluta del endpoint público de media.
 * Con CP demo (00000) pasa demo=true para pedir la partición is_fake.
 */

export function useHomeRewards(): {
  rewards: Reward[]
  loading: boolean
  error: string | null
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!postalCode) {
      setRewards([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    listPublicRewards(postalCode, {
      lang,
      demo: isDemoPostalCode(postalCode),
    })
      .then((rows) => {
        if (cancelled) return
        setRewards(rows.map((r) => toReward(r, lang)))
      })
      .catch((e) => {
        if (!cancelled) {
          setRewards([])
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

  return { rewards, loading, error }
}
