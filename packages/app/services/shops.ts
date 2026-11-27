/**
 * Catálogo público de comercios adheridos.
 */
import { z } from 'zod'

import {
  apiFetch,
  shopOutSchema,
  shopResidentOutSchema,
  type ShopOut,
  type ShopResidentOut,
} from './km0labClient'

/**
 * Comercios públicos por código postal (sin auth).
 * Usado para resolver nombre/emoji/logo al mostrar promociones.
 */
export const listPublicShops = async (
  postalCode: string,
  opts: { lang?: string; demo?: boolean } = {}
): Promise<ShopOut[]> => {
  const qs = new URLSearchParams({ postal_code: postalCode })
  if (opts.lang) {
    qs.set('lang', opts.lang)
  }
  if (opts.demo) {
    qs.set('demo', 'true')
  }
  return apiFetch(`/shops/public?${qs}`, {
    schema: z.array(shopOutSchema),
  })
}

/**
 * Comercios del residente por código postal (auth).
 * Incluye el estado de escaneo del usuario: `scanned`, `scan_available`,
 * `available_at`, `last_scanned_at`.
 */
export const listMyShops = async (
  postalCode: string,
  opts: { lang?: string; demo?: boolean } = {}
): Promise<ShopResidentOut[]> => {
  const qs = new URLSearchParams({ postal_code: postalCode })
  if (opts.lang) {
    qs.set('lang', opts.lang)
  }
  if (opts.demo) {
    qs.set('demo', 'true')
  }
  return apiFetch(`/shops/for-me?${qs}`, {
    schema: z.array(shopResidentOutSchema),
    auth: true,
  })
}
