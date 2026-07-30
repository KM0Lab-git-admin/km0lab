/**
 * Canjes del residente autenticado.
 */
import { z } from 'zod'

import {
  apiFetch,
  redemptionOutSchema,
  type RedemptionOut,
} from './km0labClient'

/** Lista de canjes del usuario (Bearer). Resident → solo los suyos. */
export const listMyRedemptions = async (): Promise<RedemptionOut[]> => {
  return apiFetch('/redemptions', {
    auth: true,
    schema: z.array(redemptionOutSchema),
  })
}
