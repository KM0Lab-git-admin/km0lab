import { useCallback, useEffect, useMemo, useState } from 'react'

import { listMyShops } from '../services/shops'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { t } from '../utils/i18n'
import { buildShopCategories, toComercAdherit } from '../utils/shopMapper'

import { useShopCategories } from './useShopCategories'

import type { ShopResidentOut } from '../services/km0labClient'
import type { CategoriaAdherit, ComercAdherit } from '../types/comercAdherit'

/**
 * useMyShops — catálogo de comercios del residente con estado de escaneo.
 * GET /shops/for-me?postal_code&lang&demo (Bearer).
 * Solo hace fetch si hay `token` (sesión de residente).
 */
export function useMyShops(): {
  shops: ShopResidentOut[]
  items: ComercAdherit[]
  categories: CategoriaAdherit[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const token = useAppStore((s) => s.token)
  const { emojiBySlug } = useShopCategories()
  const [shops, setShops] = useState<ShopResidentOut[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode && token))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!postalCode || !token) {
      setShops([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    listMyShops(postalCode, {
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
  }, [postalCode, lang, token, tick])

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
