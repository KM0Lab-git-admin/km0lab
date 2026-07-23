/**
 * eventsApi — consumo de la API real de eventos (events-query).
 *
 * Sustituye a `eventQueryApi.ts` (que llamaba al proxy Supabase sin
 * validación). Solo LECTURA: la lógica de scraping/procesado vive en el
 * repo events-query. Las pantallas consumen estas funciones vía React
 * Query; nunca hacen fetch directamente.
 *
 * Estados empty/error se prototipan con las fixtures de
 * `@/data/fixtures/` (query.json, events-today.json, categories.json).
 */
import { apiFetch } from '../services/apiClient'
import {
  queryResponseSchema,
  todayResponseSchema,
  categoriesResponseSchema,
  eventsListResponseSchema,
  eventoDetailResponseSchema,
  type QueryResponse,
  type TodayResponse,
  type Category,
  type EventsListItem,
  type EventoDetail,
  type EventImagen,
} from '../services/apiSchemas'

const EVENTS_BASE: string =
  (import.meta.env.VITE_EVENTS_API_URL as string | undefined) ??
  'https://eventquery.km0lab.com'

/** Búsqueda en lenguaje natural (experiencia chat). Rate limit 30/min. */
export async function queryEvents(
  pregunta: string,
  cpUsuario: string,
  limit = 20
): Promise<QueryResponse> {
  return apiFetch('/api/v1/query', queryResponseSchema, {
    method: 'POST',
    body: JSON.stringify({
      pregunta,
      cp_usuario: cpUsuario,
      limit,
      debug: false,
    }),
  })
}

/** Eventos de hoy (atajo optimizado para la Home/Agenda). */
export async function getTodayEvents(): Promise<TodayResponse> {
  return apiFetch('/api/v1/events/today', todayResponseSchema)
}

/** Categorías con conteo (filtros de Agenda). */
export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch('/api/v1/categories', categoriesResponseSchema)
  return res.data
}

/**
 * Evento adaptado para la Agenda: mismos nombres de campo que consumen
 * sus tarjetas. Título/descripción por idioma (por defecto es, fallback
 * ca). Las imágenes relativas de la API pasan a URL absoluta.
 */
export interface AgendaEvent {
  id_unico_evento: string
  titulo: string
  fecha_inicio: string | null
  fecha_fin: string | null
  hora_inicio: string | null
  hora_fin: string | null
  es_gratuito: boolean
  precio_euros: number | null
  poblacion_nombre: string | null
  lugar_nombre: string | null
  categorias: string[]
  tags: string[]
  url_imagen: string | null
}

function toAbsoluteImage(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${EVENTS_BASE}${url}`
}

function adaptListEvent(item: EventsListItem, lang: 'es' | 'ca'): AgendaEvent {
  const pick = (es?: string | null, ca?: string | null) =>
    (lang === 'ca' ? (ca ?? es) : (es ?? ca)) ?? ''
  return {
    id_unico_evento: item.id,
    titulo: pick(item.titulo_es, item.titulo_cat),
    fecha_inicio: item.fecha_inicio ?? null,
    fecha_fin: item.fecha_fin ?? null,
    hora_inicio: item.hora_inicio ?? null,
    hora_fin: null,
    es_gratuito: item.es_gratuito ?? false,
    precio_euros: item.precio ?? null,
    poblacion_nombre: item.poblacion ?? null,
    lugar_nombre: item.lugar ?? null,
    categorias: item.categorias_nombres?.length
      ? item.categorias_nombres
      : item.categorias,
    tags: item.categorias,
    url_imagen: toAbsoluteImage(item.imagen_url),
  }
}

export interface ListEventsParams {
  categoria?: string // slug de la API (musica, cultura, deportes…)
  poblacion?: string
  fechaDesde?: string // YYYY-MM-DD
  fechaHasta?: string // YYYY-MM-DD
  esGratuito?: boolean
  page?: number
  pageSize?: number
  lang?: 'es' | 'ca'
}

/**
 * Lista de eventos con filtros estructurados (GET /api/v1/events). Es el
 * MISMO endpoint que usa la web de eventquery, así que devuelve los
 * mismos resultados. Rate limit 100/min.
 */
export async function listEvents(
  params: ListEventsParams = {}
): Promise<{ eventos: AgendaEvent[]; total: number }> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('page_size', String(params.pageSize ?? 50))
  if (params.categoria) search.set('categoria', params.categoria)
  if (params.poblacion) search.set('poblacion', params.poblacion)
  if (params.fechaDesde) search.set('fecha_desde', params.fechaDesde)
  if (params.fechaHasta) search.set('fecha_hasta', params.fechaHasta)
  if (params.esGratuito != null)
    search.set('es_gratuito', String(params.esGratuito))

  const res = await apiFetch(
    `/api/v1/events?${search.toString()}`,
    eventsListResponseSchema
  )
  const lang = params.lang ?? 'es'
  return {
    eventos: res.data.map((item) => adaptListEvent(item, lang)),
    total: res.total,
  }
}

/* ── Detalle de evento ─────────────────────────────────────────── */

export interface EventoDetalleAdaptado {
  id: string
  titulo: string
  descripcion: string
  descripcionCorta: string
  categoria: string
  categoriasSlugs: string[]
  tags: string[]
  cp: string | null
  poblacion: string | null
  lugar: string | null
  direccion: string | null
  organizador: string | null
  organizadorWeb: string | null
  fuenteUrl: string | null
  esGratuito: boolean
  precio: number | null
  esFamilia: boolean
  fechaInicio: string | null
  fechaFin: string | null
  horaInicio: string | null
  horaFin: string | null
  horarios: {
    fechaInicio: string | null
    fechaFin: string | null
    horaInicio: string | null
    horaFin: string | null
  }[]
  imagenes: string[]
  raw: EventoDetail
}

function pickLang(
  es: string | null | undefined,
  ca: string | null | undefined,
  lang: 'es' | 'ca'
): string {
  return (lang === 'ca' ? (ca ?? es) : (es ?? ca)) ?? ''
}

function adaptImagenes(raw: EventoDetail): string[] {
  const list = (raw.imagenes ?? [])
    .slice()
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map((im: EventImagen) => toAbsoluteImage(im.url))
    .filter((u): u is string => !!u)
  if (list.length > 0) return list
  const single = toAbsoluteImage(raw.imagen_url)
  return single ? [single] : []
}

export async function getEvento(
  id: string,
  lang: 'es' | 'ca' = 'es'
): Promise<EventoDetalleAdaptado | null> {
  const search = new URLSearchParams({ id, limit: '1', offset: '0' })
  const res = await apiFetch(
    `/api/v1/eventos?${search.toString()}`,
    eventoDetailResponseSchema
  )
  const raw = res.eventos?.[0]
  if (!raw) return null
  return {
    id: raw.id,
    titulo: pickLang(raw.titulo_es, raw.titulo_cat, lang),
    descripcion: pickLang(raw.descripcion_es, raw.descripcion_cat, lang),
    descripcionCorta: pickLang(
      raw.descripcion_corta_es,
      raw.descripcion_corta_cat,
      lang
    ),
    categoria:
      (lang === 'ca' ? raw.categorias_cat : raw.categorias_es)?.[0] ??
      raw.categorias_es?.[0] ??
      raw.categorias_slugs?.[0] ??
      '',
    categoriasSlugs: raw.categorias_slugs ?? [],
    tags: (lang === 'ca' ? raw.tags_cat : raw.tags_es) ?? [],
    cp: raw.cp ?? null,
    poblacion: raw.poblacion ?? null,
    lugar: raw.lugar ?? null,
    direccion: raw.direccion ?? null,
    organizador: raw.organizador ?? null,
    organizadorWeb: raw.organizador_web ?? null,
    fuenteUrl: raw.fuente_url_original ?? null,
    esGratuito: raw.es_gratuito ?? false,
    precio: raw.precio ?? null,
    esFamilia: raw.es_familia ?? false,
    fechaInicio: raw.fecha_inicio ?? null,
    fechaFin: raw.fecha_fin ?? null,
    horaInicio: raw.hora_inicio ?? null,
    horaFin: raw.hora_fin ?? null,
    horarios: (raw.horarios ?? []).map((h) => ({
      fechaInicio: h.fecha_inicio ?? null,
      fechaFin: h.fecha_fin ?? null,
      horaInicio: h.hora_inicio ?? null,
      horaFin: h.hora_fin ?? null,
    })),
    imagenes: adaptImagenes(raw),
    raw,
  }
}
