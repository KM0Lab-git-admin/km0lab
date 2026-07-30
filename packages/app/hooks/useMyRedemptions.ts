import { useCallback, useEffect, useState } from 'react'

import { listMyRedemptions } from '../services/redemptions'
import { listPublicRewards } from '../services/rewards'
import { listPublicShops } from '../services/shops'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { toRedemption } from '../utils/redemptionMapper'

import type { Redemption } from '../types/redemption'

/**
 * useMyRedemptions — canjes del residente autenticado.
 *
 * GET /redemptions + join GET /rewards/public + GET /shops/public.
 */
export function useMyRedemptions(): {
  redemptions: Redemption[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const token = useAppStore((s) => s.token)
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!token) {
      setRedemptions([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const opts = {
      lang,
      demo: isDemoPostalCode(postalCode),
    }

    const rewardsPromise = postalCode
      ? listPublicRewards(postalCode, opts)
      : Promise.resolve([])
    const shopsPromise = postalCode
      ? listPublicShops(postalCode, opts)
      : Promise.resolve([])

    Promise.all([listMyRedemptions(), rewardsPromise, shopsPromise])
      .then(([rows, rewardRows, shopRows]) => {
        if (cancelled) return
        const rewardsById = new Map(rewardRows.map((r) => [r.id, r]))
        const shopsById = new Map(shopRows.map((s) => [s.id, s]))
        setRedemptions(
          rows.map((row) =>
            toRedemption(
              row,
              rewardsById.get(row.reward_id),
              row.shop_id ? shopsById.get(row.shop_id) : undefined,
              lang
            )
          )
        )
      })
      .catch((e) => {
        if (!cancelled) {
          setRedemptions([])
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, postalCode, lang, tick])

  return { redemptions, loading, error, reload }
}
