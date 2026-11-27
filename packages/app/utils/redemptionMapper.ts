import { toReward } from './rewardMapper'

import type { Lang } from './i18n'
import type {
  RedemptionOut,
  RewardOut,
  ShopOut,
} from '../services/km0labClient'
import type { Redemption, RedemptionStatus } from '../types/redemption'

const API_STATUS_TO_UI: Record<string, RedemptionStatus> = {
  requested: 'pending',
  pending_preparation: 'pending',
  prepared: 'pending',
  pending_use: 'ready',
  pending_pickup: 'ready',
  used: 'redeemed',
  delivered: 'redeemed',
  cancelled: 'expired',
}

/** Mapea status del ledger API a RedemptionStatus de UI. */
export function toRedemptionStatus(apiStatus: string): RedemptionStatus {
  return API_STATUS_TO_UI[apiStatus] ?? 'pending'
}

/**
 * Une RedemptionOut + RewardOut + ShopOut en el modelo de UI.
 * Si el premio ya no está en el catálogo público, usa fallbacks.
 */
export function toRedemption(
  out: RedemptionOut,
  reward: RewardOut | undefined,
  shop: ShopOut | undefined,
  lang: Lang
): Redemption {
  const status = toRedemptionStatus(out.status)
  const mapped = reward ? toReward(reward, lang) : null
  const amount = out.amount?.trim() || out.amount_applied?.trim() || ''

  return {
    id: out.id,
    rewardId: out.reward_id,
    rewardTitle: mapped?.title || amount || '—',
    rewardDescription: mapped?.description || '',
    rewardCategory: mapped?.category ?? 'merchandising',
    rewardKind: mapped?.kind ?? 'product',
    costPoints: out.points_spent,
    valueLabel: amount || mapped?.valueLabel || '',
    status,
    code: out.code?.trim() || null,
    shopName: shop?.name?.trim() || undefined,
    redeemedAt: out.requested_at,
    completedAt: out.used_at || out.delivered_at || undefined,
    imageUrl: mapped?.imageUrl ?? null,
    hasImage: mapped?.hasImage ?? false,
  }
}
