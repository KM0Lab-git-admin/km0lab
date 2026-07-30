import { useEffect, useState } from 'react'

import { listPublicPromotions } from '../services/promotions'
import { listPublicShops } from '../services/shops'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { toShopPromotion } from '../utils/shopPromotionMapper'

import type { ShopPromotion } from '../types/shopPromotion'

/**
 * useShopPromotions — catálogo de promociones de comercios.
 *
 * GET /promotions/public + GET /shops/public (join por shop_id).
 * Con CP demo (00000) pasa demo=true en ambas llamadas.
 */
export function useShopPromotions(): {
  promotions: ShopPromotion[]
  loading: boolean
  error: string | null
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const [promotions, setPromotions] = useState<ShopPromotion[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!postalCode) {
      setPromotions([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const opts = { lang, demo: isDemoPostalCode(postalCode) }

    Promise.all([
      listPublicPromotions(postalCode, opts),
      listPublicShops(postalCode, opts),
    ])
      .then(([promoRows, shopRows]) => {
        if (cancelled) return
        const byId = new Map(shopRows.map((s) => [s.id, s]))
        setPromotions(
          promoRows.map((p) => toShopPromotion(p, byId.get(p.shop_id)))
        )
      })
      .catch((e) => {
        if (!cancelled) {
          setPromotions([])
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

  return { promotions, loading, error }
}
