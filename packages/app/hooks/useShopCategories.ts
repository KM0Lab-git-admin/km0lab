import { useCallback, useEffect, useMemo, useState } from 'react'

import { listShopCategories } from '../services/shopCategories'
import { useAppStore } from '../stores/useAppStore'
import { shopCategoryEmoji } from '../utils/shopCategoryEmoji'

import type { ShopCategoryOut } from '../services/km0labClient'

/**
 * useShopCategories — catálogo público de categorías (label + emoji).
 * GET /shop-categories?lang
 */
export function useShopCategories(): {
  categories: ShopCategoryOut[]
  /** slug → emoji de la API (sin fallbacks locales). */
  emojiBySlug: ReadonlyMap<string, string>
  /** Resuelve emoji: API → fallback local → 🏷️ */
  emojiFor: (slug: string | null | undefined) => string
  loading: boolean
  error: string | null
  reload: () => void
} {
  const lang = useAppStore((s) => s.lang)
  const [categories, setCategories] = useState<ShopCategoryOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    listShopCategories({ lang })
      .then((rows) => {
        if (!cancelled) setCategories(rows)
      })
      .catch((e) => {
        if (!cancelled) {
          setCategories([])
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lang, tick])

  const emojiBySlug = useMemo(() => {
    const map = new Map<string, string>()
    for (const cat of categories) {
      const emoji = cat.emoji?.trim()
      if (emoji) map.set(cat.slug, emoji)
    }
    return map
  }, [categories])

  const emojiFor = useCallback(
    (slug: string | null | undefined) => {
      const key = (slug ?? '').trim()
      if (!key) return shopCategoryEmoji('other')
      return emojiBySlug.get(key) ?? shopCategoryEmoji(key)
    },
    [emojiBySlug]
  )

  return { categories, emojiBySlug, emojiFor, loading, error, reload }
}
