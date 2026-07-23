/**
 * newsApi — consumo de noticias municipales (events-query /api/v1/news).
 *
 * La API devuelve campos bilingües con sufijo (`titulo_cat` / `titulo_es`).
 * Este adaptador los convierte al patrón de la app (diccionario por idioma,
 * como `lib/i18n.ts`), de modo que las pantallas hacen
 * `noticia.titulo[lang]` sin ramas por idioma. El inglés cae a español
 * mientras el scraper no lo genere.
 *
 * NOTA: /api/v1/news devuelve 500 en producción a 2026-07-21 (pendiente
 * de fix en events-query). Hasta entonces, prototipar con la fixture
 * `@/data/fixtures/news.json` (sintética, mismo shape).
 */
import { apiFetch } from '../services/apiClient'
import {
  newsListResponseSchema,
  newsDetailResponseSchema,
  type NewsItem,
} from '../services/apiSchemas'

import type { Lang } from '../utils/i18n'

export interface Noticia {
  id: string
  ciudad: string | null
  titulo: Record<Lang, string>
  resumen: Record<Lang, string>
  cuerpo: Record<Lang, string>
  tags: Record<Lang, string[]>
  fechaPublicacion: string | null
  imagenUrl: string | null
  fuenteUrl: string | null
}

function porIdioma(
  cat?: string | null,
  es?: string | null
): Record<Lang, string> {
  return { ca: cat ?? es ?? '', es: es ?? cat ?? '', en: es ?? cat ?? '' }
}

export function adaptNoticia(item: NewsItem): Noticia {
  return {
    id: item.id,
    ciudad: item.ciudad ?? null,
    titulo: porIdioma(item.titulo_cat, item.titulo_es),
    resumen: porIdioma(item.resumen_cat, item.resumen_es),
    cuerpo: porIdioma(item.cuerpo_cat, item.cuerpo_es),
    tags: {
      ca: item.tags_cat,
      es: item.tags_es,
      en: item.tags_es,
    },
    fechaPublicacion: item.fecha_publicacion ?? null,
    imagenUrl: item.imagen_principal_url ?? null,
    fuenteUrl: item.fuente_url_original ?? null,
  }
}

export interface ListNewsParams {
  city?: string
  limit?: number
  offset?: number
}

/** Noticias activas, más recientes primero. Rate limit 100/min. */
export async function listNews(
  params: ListNewsParams = {}
): Promise<{ noticias: Noticia[]; total: number }> {
  const search = new URLSearchParams()
  if (params.city) search.set('city', params.city)
  if (params.limit) search.set('limit', String(params.limit))
  if (params.offset) search.set('offset', String(params.offset))
  const qs = search.toString()
  const res = await apiFetch(
    `/api/v1/news${qs ? `?${qs}` : ''}`,
    newsListResponseSchema
  )
  return { noticias: res.data.map(adaptNoticia), total: res.total }
}

/** Detalle de una noticia activa. */
export async function getNoticia(id: string): Promise<Noticia> {
  const res = await apiFetch(
    `/api/v1/news/${encodeURIComponent(id)}`,
    newsDetailResponseSchema
  )
  return adaptNoticia(res.data)
}
