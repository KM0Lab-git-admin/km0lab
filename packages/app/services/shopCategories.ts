/**
 * Catálogo público de categorías de comercio (label + emoji desde API).
 */
import { z } from 'zod'

import {
  apiFetch,
  shopCategoryOutSchema,
  type ShopCategoryOut,
} from './km0labClient'

/** Categorías activas; `lang` resuelve `label` (ca|es|en). */
export const listShopCategories = async (
  opts: { lang?: string; includeInactive?: boolean } = {}
): Promise<ShopCategoryOut[]> => {
  const qs = new URLSearchParams()
  if (opts.lang) qs.set('lang', opts.lang)
  if (opts.includeInactive) qs.set('include_inactive', 'true')
  const suffix = qs.toString() ? `?${qs}` : ''
  return apiFetch(`/shop-categories${suffix}`, {
    schema: z.array(shopCategoryOutSchema),
  })
}
