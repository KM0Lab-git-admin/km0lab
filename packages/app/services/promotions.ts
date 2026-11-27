/**
 * Catálogo público de promociones de comercios adheridos.
 */
import { z } from 'zod'

import { apiFetch, promotionOutSchema, type PromotionOut } from './km0labClient'

/**
 * Promociones públicas por código postal (sin auth).
 * El backend resuelve postal_code → town, filtra activas de shops activos
 * y traduce label/title/detail/conditions según `lang` (ca|es|en).
 */
export const listPublicPromotions = async (
  postalCode: string,
  opts: { lang?: string; demo?: boolean } = {}
): Promise<PromotionOut[]> => {
  const qs = new URLSearchParams({ postal_code: postalCode })
  if (opts.lang) {
    qs.set('lang', opts.lang)
  }
  if (opts.demo) {
    qs.set('demo', 'true')
  }
  return apiFetch(`/promotions/public?${qs}`, {
    schema: z.array(promotionOutSchema),
  })
}
