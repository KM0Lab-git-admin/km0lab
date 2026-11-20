import { z } from 'zod'

import { toRedemptionStatus } from '../utils/redemptionMapper'

import { notifyAccountChanged } from './accountEvents'
import {
  apiFetch,
  redemptionOutSchema,
  type RedemptionOut,
} from './km0labClient'

import type { Redemption } from '../types/redemption'
import type { Reward } from '../types/reward'

/**
 * Canjes del vecino con sesión. GET /redemptions (Bearer).
 */
export const listMyRedemptions = async (): Promise<RedemptionOut[]> => {
  return apiFetch('/redemptions', {
    auth: true,
    schema: z.array(redemptionOutSchema),
  })
}

/**
 * Canjea un premio: `POST /redemptions`. El servidor valida saldo, stock y
 * municipio, descuenta los puntos y, si el premio es un vale, emite el
 * código de recogida (`code`); en productos y experiencias no hay código.
 *
 * Costura con Lovable (`src/services/redemptions.ts`, simulado allí).
 */
export const redeemReward = async (
  reward: Pick<
    Reward,
    | 'id'
    | 'title'
    | 'description'
    | 'category'
    | 'kind'
    | 'valueLabel'
    | 'imageUrl'
  >
): Promise<Redemption> => {
  const out = await apiFetch('/redemptions', {
    method: 'POST',
    auth: true,
    body: { reward_id: reward.id },
    schema: redemptionOutSchema,
  })
  notifyAccountChanged()
  return {
    id: out.id,
    rewardId: reward.id,
    rewardTitle: reward.title,
    rewardDescription: reward.description,
    rewardCategory: reward.category,
    rewardKind: reward.kind,
    costPoints: out.points_spent,
    valueLabel: out.amount?.trim() || reward.valueLabel,
    status: toRedemptionStatus(out.status),
    code: out.code?.trim() || null,
    redeemedAt: out.requested_at,
    imageUrl: reward.imageUrl ?? null,
    hasImage: Boolean(reward.imageUrl),
  }
}
