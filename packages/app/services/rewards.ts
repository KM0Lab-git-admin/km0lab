/**
 * Catálogo público de premios canjeables por puntos.
 */
import { z } from 'zod'

import { apiFetch, rewardOutSchema, type RewardOut } from './km0labClient'

/**
 * Catálogo público de premios por código postal (sin auth).
 * El backend resuelve postal_code → town, filtra activos y traduce
 * name/description/conditions según `lang` (ca|es|en).
 */
export const listPublicRewards = async (
  postalCode: string,
  opts: { lang?: string } = {}
): Promise<RewardOut[]> => {
  const qs = new URLSearchParams({ postal_code: postalCode })
  if (opts.lang) {
    qs.set('lang', opts.lang)
  }
  return apiFetch(`/rewards/public?${qs}`, {
    schema: z.array(rewardOutSchema),
  })
}
