import { resolveMediaUrl } from './rewardMapper'

import type { PromotionOut, ShopOut } from '../services/km0labClient'
import type { PromocioInfo, ShopPromotion } from '../types/comercAdherit'

/**
 * La API ya devuelve título, detalle y condiciones en el idioma pedido
 * (`?lang=`), así que las dos variantes del tipo de pantalla llevan el
 * mismo texto.
 */
const both = (text: string | null | undefined) => {
  const value = text?.trim() ?? ''
  return { ca: value, es: value }
}

/** API promotion → promoción dentro de la ficha de un comercio. */
export function toPromocioInfo(promo: PromotionOut): PromocioInfo {
  return {
    id: promo.id,
    etiqueta: promo.label,
    titol: both(promo.title),
    detall: both(promo.detail),
    condicio: promo.conditions?.trim() ? both(promo.conditions) : undefined,
  }
}

/** API promotion + su comercio → promoción para listados (Home, Premios). */
export function toShopPromotion(
  promo: PromotionOut,
  shop: ShopOut | null | undefined
): ShopPromotion {
  const hasLogo = Boolean(shop?.has_logo && shop.logo_url)
  return {
    ...toPromocioInfo(promo),
    shopId: promo.shop_id,
    shopName: shop?.name?.trim() || '',
    shopEmoji: shop?.emoji?.trim() || undefined,
    shopImage: hasLogo
      ? (resolveMediaUrl(shop!.logo_url) ?? undefined)
      : undefined,
  }
}
