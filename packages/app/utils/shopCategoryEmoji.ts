/**
 * Emojis de categoría de comercio (slugs API).
 * Fuente única para listados, filtros y fallbacks sin logo.
 */
export const SHOP_CATEGORY_EMOJI: Record<string, string> = {
  bakery: '🥐',
  food: '🛒',
  cafe: '☕',
  restaurant: '🍽️',
  bar: '🍺',
  butcher: '🥩',
  greengrocer: '🥬',
  fishmonger: '🐟',
  pharmacy: '💊',
  bookstore: '📚',
  clothing: '👕',
  hairdresser: '💇',
  services: '🔧',
  other: '🏷️',
}

/** Emoji de categoría; fallback genérico si el slug no es conocido. */
export function shopCategoryEmoji(slug: string | null | undefined): string {
  const key = (slug ?? '').trim() || 'other'
  return SHOP_CATEGORY_EMOJI[key] ?? '🏷️'
}
