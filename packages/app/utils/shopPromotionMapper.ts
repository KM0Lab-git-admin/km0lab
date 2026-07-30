import { resolveMediaUrl } from './rewardMapper'

import type { PromotionOut, ShopOut } from '../services/km0labClient'
import type { ShopPromotion } from '../types/shopPromotion'

/** Une PromotionOut + ShopOut (opcional) a ShopPromotion de UI. */
export function toShopPromotion(
  promo: PromotionOut,
  shop: ShopOut | null | undefined
): ShopPromotion {
  const hasLogo = Boolean(shop?.has_logo && shop.logo_url)
  return {
    id: promo.id,
    shopId: promo.shop_id,
    shopName: shop?.name?.trim() || '',
    shopEmoji: shop?.emoji ?? null,
    shopImageUrl: hasLogo ? resolveMediaUrl(shop!.logo_url) : null,
    shopCategories: shop?.categories ?? [],
    label: promo.label,
    title: promo.title,
    detail: promo.detail,
    conditions: promo.conditions ?? null,
  }
}
