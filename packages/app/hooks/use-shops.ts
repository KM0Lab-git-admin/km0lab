import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApiError } from '../services/km0labClient'
import { listMyShops, listPublicShops } from '../services/shops'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'
import { t } from '../utils/i18n'
import { buildShopCategories, toComercAdherit } from '../utils/shopMapper'

import { usePointsConfig } from './use-points-config'
import { useShopCategories } from './useShopCategories'

import type { ShopOut, ShopResidentOut } from '../services/km0labClient'
import type { CategoriaAdherit, ComercAdherit } from '../types/comercAdherit'

export type ShopRow = ShopOut | ShopResidentOut

/**
 * Comercios del municipio tal como los da la API. Con sesión se pide
 * `GET /shops/for-me` (incluye si el vecino ya escaneó cada comercio); sin
 * sesión, o si la sesión ha caducado, `GET /shops/public`.
 */
export function useShopRows(): {
  rows: ShopRow[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const token = useAppStore((s) => s.token)
  const [rows, setRows] = useState<ShopRow[]>([])
  const [loading, setLoading] = useState(Boolean(postalCode))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!postalCode) {
      setRows([])
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const opts = { lang, demo: isDemoPostalCode(postalCode) }
    const request: Promise<ShopRow[]> = token
      ? listMyShops(postalCode, opts).catch((e: unknown) => {
          if (e instanceof ApiError && e.status === 401) {
            return listPublicShops(postalCode, opts)
          }
          throw e
        })
      : listPublicShops(postalCode, opts)
    request
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([])
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

  return { rows, loading, error, reload }
}

/**
 * useShops — comercios adheridos del municipio y sus categorías.
 * Costura con Lovable (`src/hooks/use-shops.ts`, con ejemplos allí).
 */
export function useShops(): {
  shops: ComercAdherit[]
  categories: CategoriaAdherit[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const { rows, loading, error, reload } = useShopRows()
  const { emojiBySlug } = useShopCategories()
  // El servidor abona por escaneo lo que fija el municipio, no el valor
  // de cada comercio: se enseña lo que de verdad se gana.
  const { scan } = usePointsConfig()
  const shops = useMemo(
    () => rows.map((row) => ({ ...toComercAdherit(row), punts: scan })),
    [rows, scan]
  )
  const categories = useMemo(
    () =>
      buildShopCategories(
        shops,
        {
          ca: t('merchants.filter_all', 'ca'),
          es: t('merchants.filter_all', 'es'),
        },
        emojiBySlug
      ),
    [shops, emojiBySlug]
  )
  return { shops, categories, loading, error, reload }
}
