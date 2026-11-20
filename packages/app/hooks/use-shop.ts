import { useCallback, useEffect, useMemo, useState } from 'react'

import { listPublicPromotions } from '../services/promotions'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { toComercDetall } from '../utils/shopMapper'
import { toPromocioInfo } from '../utils/shopPromotionMapper'

import { useShopRows } from './use-shops'

import type { PromotionOut } from '../services/km0labClient'
import type { ComercDetall } from '../types/comercAdherit'

/**
 * useShop — ficha de un comercio del municipio.
 *
 * Costura con Lovable. La API no tiene un «comercio por id» público, así
 * que se localiza en el listado del municipio y se le añaden sus
 * promociones (`GET /promotions/public`). `visitat` sale de
 * `GET /shops/for-me` cuando hay sesión.
 */
export function useShop(id: string): {
  shop: ComercDetall | null
  loading: boolean
  error: string | null
  reload: () => void
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const shops = useShopRows()
  const [promos, setPromos] = useState<PromotionOut[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!postalCode) {
      setPromos([])
      return
    }
    let cancelled = false
    listPublicPromotions(postalCode, {
      lang,
      demo: isDemoPostalCode(postalCode),
    })
      .then((rows) => {
        if (!cancelled) setPromos(rows)
      })
      .catch(() => {
        // La ficha se enseña igualmente, sin promociones.
        if (!cancelled) setPromos([])
      })
    return () => {
      cancelled = true
    }
  }, [postalCode, lang, tick])

  const reloadShops = shops.reload
  const reload = useCallback(() => {
    reloadShops()
    setTick((n) => n + 1)
  }, [reloadShops])

  const shop = useMemo(() => {
    const row = shops.rows.find((s) => s.id === id)
    if (!row) return null
    return toComercDetall(row, lang, {
      visitat: 'scanned' in row ? row.scanned : false,
      promocions: promos.filter((p) => p.shop_id === id).map(toPromocioInfo),
    })
  }, [shops.rows, promos, id, lang])

  return { shop, loading: shops.loading, error: shops.error, reload }
}
