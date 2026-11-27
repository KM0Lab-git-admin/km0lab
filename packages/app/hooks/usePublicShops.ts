import { useCallback, useEffect, useMemo, useState } from 'react'

import { listPublicShops } from '../services/shops'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { t } from '../utils/i18n'
import { buildShopCategories, toComercAdherit } from '../utils/shopMapper'

import { useShopCategories } from './useShopCategories'

import type { ShopOut } from '../services/km0labClient'
import type { CategoriaAdherit, ComercAdherit } from '../types/comercAdherit'

/**
 * usePublicShops — catálogo público de comercios adheridos.
 * GET /shops/public?postal_code&lang&demo
 */
export function usePublicShops(): {
  shops: ShopOut[]
  items: ComercAdherit[]
  categories: CategoriaAdherit[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const { emojiBySlug } = useShopCategories()
  const [shops, setShops] = useState<ShopOut[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!postalCode) {
      setShops([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    listPublicShops(postalCode, {
      lang,
      demo: isDemoPostalCode(postalCode),
    })
      .then((rows) => {
        if (!cancelled) setShops(rows)
      })
      .catch((e) => {
        if (!cancelled) {
          setShops([])
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postalCode, lang, tick])

  const items = useMemo(() => shops.map(toComercAdherit), [shops])

  const categories = useMemo(
    () =>
      buildShopCategories(
        items,
        {
          ca: t('merchants.filter_all', 'ca'),
          es: t('merchants.filter_all', 'es'),
        },
        emojiBySlug
      ),
    [items, emojiBySlug]
  )

  return { shops, items, categories, loading, error, reload }
}
