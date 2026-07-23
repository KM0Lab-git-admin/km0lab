/**
 * apiSchemas — contrato zod de la API events-query (v1).
 *
 * Fuente de verdad: modelos Pydantic de `events-query/app/models/schemas.py`
 * y handlers de `app/api/v1/*` (rama develop, commit 4884da0), verificados
 * contra respuestas reales de https://eventquery.km0lab.com el 2026-07-21.
 *
 * Regla: los campos que el backend declara Optional van como `.nullish()`
 * (acepta null y ausente). Solo los identificadores son obligatorios.
 * Fixtures reales en `@/data/fixtures/*.json`.
 */
import { z } from 'zod'

/* ── POST /api/v1/query (chat / búsqueda NL) ─────────────────────── */

export const eventoSchema = z.object({
  id_unico_evento: z.string(),
  titulo: z.string().nullish(),
  descripcion_corta: z.string().nullish(),
  descripcion_larga: z.string().nullish(),
  cp_evento: z.string().nullish(),
  poblacion_nombre: z.string().nullish(),
  lugar_nombre: z.string().nullish(),
  direccion_completa: z.string().nullish(),
  id_recinto: z.number().nullish(),
  recinto_nombre_canonico: z.string().nullish(),
  recinto_tipo: z.string().nullish(),
  fecha_inicio: z.string().nullish(), // ISO date "2026-07-21"
  fecha_fin: z.string().nullish(),
  hora_inicio: z.string().nullish(),
  hora_fin: z.string().nullish(),
  es_gratuito: z.boolean().nullish(),
  precio_euros: z.number().nullish(),
  categorias: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  url_evento: z.string().nullish(),
  url_imagen: z.string().nullish(),
  distancia_km: z.number().nullish(),
  similitud_score: z.number().nullish(),
  nivel_coincidencia: z.string().nullish(), // mayor | templada | baja | muy_poca
})

export const queryResponseSchema = z.object({
  respuesta_texto: z.string(),
  eventos: z.array(eventoSchema),
  total: z.number(),
  idioma_respuesta: z.string(), // "es" | "ca"
  debug_info: z.unknown().nullish(),
})

/* ── GET /api/v1/events/today ────────────────────────────────────── */

export const eventImagenSchema = z.object({
  url: z.string(),
  nombre_archivo: z.string().nullish(),
  tipo_archivo: z.string().nullish(),
  es_principal: z.boolean().nullish(),
  orden: z.number().nullish(),
  ancho_px: z.number().nullish(),
  alto_px: z.number().nullish(),
  orientacion: z.string().nullish(),
  url_original_externa: z.string().nullish(),
})

export const todayEventCardSchema = z.object({
  id: z.string(),
  titulo_es: z.string().nullish(),
  titulo_cat: z.string().nullish(),
  cp: z.string().nullish(),
  poblacion: z.string().nullish(),
  lugar: z.string().nullish(),
  es_gratuito: z.boolean().nullish(),
  precio: z.number().nullish(),
  imagen_url: z.string().nullish(),
  hora_inicio: z.string().nullish(),
  hora_fin: z.string().nullish(),
  categorias: z.array(z.string()).default([]),
  imagenes: z.array(eventImagenSchema).default([]),
})

export const todayResponseSchema = z.object({
  data: z.array(todayEventCardSchema),
  total: z.number(),
  fecha: z.string(),
})

/* ── GET /api/v1/categories ──────────────────────────────────────── */

export const categorySchema = z.object({
  id: z.number(),
  slug: z.string(),
  nombre_es: z.string(),
  nombre_cat: z.string(),
  count: z.number().nullish(),
  color_hex: z.string().nullish(), // presente en develop, aún no en prod
  icono: z.string().nullish(),
})

export const categoriesResponseSchema = z.object({
  data: z.array(categorySchema),
})

/* ── GET /api/v1/news y /api/v1/news/{id} ────────────────────────── */
/* NOTA: el endpoint devuelve 500 en prod a 2026-07-21 (pendiente de fix
 * en events-query). Shape tomado del handler `_row_to_news`. */

export const newsItemSchema = z.object({
  id: z.string(),
  ciudad: z.string().nullish(),
  titulo_cat: z.string().nullish(),
  titulo_es: z.string().nullish(),
  cuerpo_cat: z.string().nullish(),
  cuerpo_es: z.string().nullish(),
  resumen_cat: z.string().nullish(),
  resumen_es: z.string().nullish(),
  tags_cat: z.array(z.string()).default([]),
  tags_es: z.array(z.string()).default([]),
  fecha_publicacion: z.string().nullish(), // ISO datetime
  imagen_principal_url: z.string().nullish(),
  fuente_url_original: z.string().nullish(),
  idioma_origen: z.string().nullish(),
})

export const newsListResponseSchema = z.object({
  data: z.array(newsItemSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const newsDetailResponseSchema = z.object({
  data: newsItemSchema,
})

/* ── GET /api/v1/events (lista paginada con filtros) ─────────────── */
/* Verificado contra la API real (eventquery.km0lab.com) 2026-07-22. */

export const eventsListItemSchema = z.object({
  id: z.string(),
  titulo_es: z.string().nullish(),
  titulo_cat: z.string().nullish(),
  descripcion_corta_es: z.string().nullish(),
  descripcion_corta_cat: z.string().nullish(),
  cp: z.string().nullish(),
  poblacion: z.string().nullish(),
  lugar: z.string().nullish(),
  es_gratuito: z.boolean().nullish(),
  precio: z.number().nullish(),
  imagen_url: z.string().nullish(),
  fecha_inicio: z.string().nullish(),
  fecha_fin: z.string().nullish(),
  hora_inicio: z.string().nullish(),
  categorias: z.array(z.string()).default([]),
  categorias_nombres: z.array(z.string()).default([]),
  es_familia: z.boolean().nullish(),
  actividades: z.array(z.unknown()).nullish(),
  imagenes: z.array(eventImagenSchema).default([]),
})

export const eventsListResponseSchema = z.object({
  data: z.array(eventsListItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  total_pages: z.number(),
  has_next: z.boolean().nullish(),
  has_prev: z.boolean().nullish(),
})

/* ── GET /api/v1/eventos?id=<id>&limit=1 (detalle rico) ─────────── */
/* Shape verificada 2026-07-22: incluye descripcion completa, horarios[],
 * organizador, tags, fuente_url_original, imagenes[]. */

export const horarioSchema = z.object({
  fecha_inicio: z.string().nullish(),
  fecha_fin: z.string().nullish(),
  hora_inicio: z.string().nullish(),
  hora_fin: z.string().nullish(),
  es_recurrente: z.boolean().nullish(),
  recurrencia: z.unknown().nullish(),
})

export const eventoDetailSchema = z.object({
  id: z.string(),
  familia: z.string().nullish(),
  titulo_es: z.string().nullish(),
  titulo_cat: z.string().nullish(),
  descripcion_es: z.string().nullish(),
  descripcion_cat: z.string().nullish(),
  descripcion_corta_es: z.string().nullish(),
  descripcion_corta_cat: z.string().nullish(),
  cp: z.string().nullish(),
  poblacion: z.string().nullish(),
  lugar: z.string().nullish(),
  direccion: z.string().nullish(),
  tipo_organizador: z.string().nullish(),
  organizador: z.string().nullish(),
  organizador_web: z.string().nullish(),
  fuente_url_original: z.string().nullish(),
  es_gratuito: z.boolean().nullish(),
  precio: z.number().nullish(),
  imagen_url: z.string().nullish(),
  tags_es: z.array(z.string()).default([]),
  tags_cat: z.array(z.string()).default([]),
  fecha_inicio: z.string().nullish(),
  fecha_fin: z.string().nullish(),
  hora_inicio: z.string().nullish(),
  hora_fin: z.string().nullish(),
  es_recurrente: z.boolean().nullish(),
  recurrencia: z.unknown().nullish(),
  horarios: z.array(horarioSchema).default([]),
  categorias_slugs: z.array(z.string()).default([]),
  categorias_es: z.array(z.string()).default([]),
  categorias_cat: z.array(z.string()).default([]),
  es_familia: z.boolean().nullish(),
  actividades: z.array(z.unknown()).default([]),
  imagenes: z.array(eventImagenSchema).default([]),
})

export const eventoDetailResponseSchema = z.object({
  eventos: z.array(eventoDetailSchema),
  total: z.number().nullish(),
  limit: z.number().nullish(),
  offset: z.number().nullish(),
  has_more: z.boolean().nullish(),
  filtros_aplicados: z.unknown().nullish(),
})

/* ── Tipos inferidos (contrato compartido con producción) ────────── */

export type Evento = z.infer<typeof eventoSchema>
export type QueryResponse = z.infer<typeof queryResponseSchema>
export type EventImagen = z.infer<typeof eventImagenSchema>
export type TodayEventCard = z.infer<typeof todayEventCardSchema>
export type TodayResponse = z.infer<typeof todayResponseSchema>
export type Category = z.infer<typeof categorySchema>
export type NewsItem = z.infer<typeof newsItemSchema>
export type NewsListResponse = z.infer<typeof newsListResponseSchema>
export type EventsListItem = z.infer<typeof eventsListItemSchema>
export type EventsListResponse = z.infer<typeof eventsListResponseSchema>
export type EventoDetail = z.infer<typeof eventoDetailSchema>
export type EventoHorario = z.infer<typeof horarioSchema>
