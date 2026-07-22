/**
 * Promo — entrada del carrusel "Eventos destacados".
 *
 * Cada slide muestra:
 *  - Un carrusel de imágenes propio del evento (parte superior).
 *  - Título, fecha y ubicación específica (parte inferior).
 *  - Un CTA circular para abrir el detalle.
 */
export interface PromoBadge {
  text: string
  bg: string
  text_color: string
  emoji?: string
}

export interface Promo {
  id: string
  /** Título principal en 1-2 líneas (ej.: "Festa Major\nRomana 2026"). */
  title: string
  /** Rango de fechas legible (ej.: "Del 15 al 19 de julio"). */
  dateRange: string
  /** Ubicación concreta del evento (ej.: "Plaça de la Vila"). No repetir la ciudad. */
  location: string
  /** Badge de categoría (aún se conserva por compatibilidad; no siempre se muestra). */
  badge: PromoBadge
  /** Gradiente decorativo (fallback si faltan imágenes). */
  gradient: string
  /** Galería de imágenes del evento (1..n). Se muestra como carrusel interno. */
  images: string[]
}
