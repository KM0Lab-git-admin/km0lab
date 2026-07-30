/**
 * Reclamo de puntos y catálogo público de acciones.
 */
import { z } from 'zod'

import {
  apiFetch,
  claimPointsSchema,
  pointActionOutSchema,
  type ClaimPoints,
  type PointActionOut,
} from './km0labClient'

export const claimBirthday = async (): Promise<ClaimPoints | null> => {
  try {
    return await apiFetch('/points/claim-birthday', {
      method: 'POST',
      auth: true,
      schema: claimPointsSchema,
    })
  } catch {
    return null
  }
}

/**
 * Catálogo público de acciones por código postal (sin auth).
 * El backend resuelve postal_code → town, filtra activas y traduce
 * name/description según `lang` (ca|es|en).
 */
export const listPublicActions = async (
  postalCode: string,
  opts: { visibleHome?: boolean; lang?: string } = {}
): Promise<PointActionOut[]> => {
  const qs = new URLSearchParams({ postal_code: postalCode })
  if (opts.visibleHome !== undefined) {
    qs.set('visible_home', String(opts.visibleHome))
  }
  if (opts.lang) {
    qs.set('lang', opts.lang)
  }
  return apiFetch(`/actions/public?${qs}`, {
    schema: z.array(pointActionOutSchema),
  })
}
