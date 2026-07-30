/**
 * ShopPromotion — promoción informativa de un comercio (catálogo público API).
 * Textos ya resueltos al idioma pedido; shop unido por shop_id.
 */
export interface ShopPromotion {
  id: string
  shopId: string
  shopName: string
  shopEmoji: string | null
  shopImageUrl: string | null
  /** Slugs de categoría del comercio (p. ej. bakery, cafe). */
  shopCategories: string[]
  label: string
  title: string
  detail: string
  conditions: string | null
}
