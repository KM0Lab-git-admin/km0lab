/**
 * Fallback de emojis por slug (si la API aún no expone emoji o falla la carga).
 * Fuente canónica: `shop_categories.emoji` vía GET /shop-categories.
 * Mantener alineado con app/catalog/shop_categories.py (km0lab-api).
 */
export const SHOP_CATEGORY_EMOJI: Record<string, string> = {
  bakery: '🥖',
  food: '🛒',
  cafe: '☕',
  restaurant: '🍽️',
  bar: '🍺',
  butcher: '🥩',
  greengrocer: '🍎',
  fishmonger: '🐟',
  pharmacy: '💊',
  bookstore: '📚',
  clothing: '👗',
  hairdresser: '✂️',
  services: '💻',
  other: '📦',
}

/** Emoji de categoría; fallback genérico si el slug no es conocido. */
export function shopCategoryEmoji(slug: string | null | undefined): string {
  const key = (slug ?? '').trim() || 'other'
  return SHOP_CATEGORY_EMOJI[key] ?? '🏷️'
}
