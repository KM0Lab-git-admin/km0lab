import { DEMO_TOWN_NAME, MALGRAT_CONTENT_TOWN } from '../utils/demoTown'

import {
  listEvents,
  type AgendaEvent,
  type ListEventsParams,
} from './eventsApi'
import { listNews, type ListNewsParams, type Noticia } from './newsApi'

import type {
  ScopedItem,
  ScopeListing,
  Territory,
  Town,
} from '../types/territory'

/**
 * municipalListings — agenda y noticias completas de un municipio.
 *
 * Costura con Lovable (`src/services/municipalListings.ts`). Recorre todas
 * las páginas de events-query para que los recuentos por categoría no se
 * queden cortos. Además traduce el municipio de demostración al municipio
 * del que toma el contenido: las pantallas enseñan «Demo KM0» y aquí se
 * pide el contenido de Malgrat.
 */
const contentTown = (name: string | undefined): string | undefined =>
  name?.trim() === DEMO_TOWN_NAME ? MALGRAT_CONTENT_TOWN : name

export async function listMunicipalEvents(
  params: ListEventsParams
): Promise<AgendaEvent[]> {
  const items = new Map<string, AgendaEvent>()
  const poblacion = contentTown(params.poblacion)
  let page = 1
  for (;;) {
    const result = await listEvents({
      ...params,
      poblacion,
      page,
      pageSize: 100,
    })
    const before = items.size
    for (const item of result.eventos) items.set(item.id_unico_evento, item)
    if (items.size >= result.total) return [...items.values()]
    if (items.size === before) throw new Error('Incomplete event pagination')
    page += 1
  }
}

export async function listMunicipalNews(
  params: ListNewsParams
): Promise<Noticia[]> {
  const items = new Map<string, Noticia>()
  const city = contentTown(params.city)
  let offset = 0
  for (;;) {
    const result = await listNews({ ...params, city, limit: 20, offset })
    const before = items.size
    for (const item of result.noticias) items.set(item.id, item)
    if (items.size >= result.total) return [...items.values()]
    if (items.size === before) throw new Error('Incomplete news pagination')
    offset += result.noticias.length
  }
}

async function listScope<T>(
  territory: Territory,
  fetchTown: (town: Town) => Promise<T[]>,
  idOf: (item: T) => string,
  compare: (a: T, b: T) => number
): Promise<ScopeListing<T>> {
  const results = await Promise.allSettled(territory.towns.map(fetchTown))
  if (results.every((result) => result.status === 'rejected')) {
    throw new Error('Scope listing failed')
  }
  const seen = new Set<string>()
  const home: ScopedItem<T>[] = []
  const nearby: ScopedItem<T>[] = []
  const failedTownIds: string[] = []
  const indexes = territory.towns.map((_, i) => i)
  const homeIndex = territory.towns.findIndex(
    (town) => town.id === territory.homeTownId
  )
  const order =
    homeIndex < 0
      ? indexes
      : [homeIndex, ...indexes.filter((i) => i !== homeIndex)]
  for (const index of order) {
    const town = territory.towns[index]
    const result = results[index]
    if (!town || !result) continue
    if (result.status === 'rejected') {
      failedTownIds.push(town.id)
      continue
    }
    for (const item of result.value) {
      const id = idOf(item)
      if (seen.has(id)) continue
      seen.add(id)
      const target = town.id === territory.homeTownId ? home : nearby
      target.push({ item, town })
    }
  }
  const byItem = (a: ScopedItem<T>, b: ScopedItem<T>) => compare(a.item, b.item)
  return { home: home.sort(byItem), nearby: nearby.sort(byItem), failedTownIds }
}

const newestFirst = (a: Noticia, b: Noticia) =>
  (b.fechaPublicacion ?? '').localeCompare(a.fechaPublicacion ?? '')

const soonestFirst = (a: AgendaEvent, b: AgendaEvent) =>
  `${a.fecha_inicio ?? '9999'}${a.hora_inicio ?? ''}`.localeCompare(
    `${b.fecha_inicio ?? '9999'}${b.hora_inicio ?? ''}`
  )

/**
 * Noticias del ámbito: una petición por población, en paralelo; si una
 * falla no esconde las demás. Costura con Lovable, sin su fuente de
 * muestra: en producción solo hay contenido real.
 */
export function listScopeNews(
  territory: Territory,
  params: Omit<ListNewsParams, 'city'> = {}
): Promise<ScopeListing<Noticia>> {
  return listScope(
    territory,
    (town) => listMunicipalNews({ ...params, city: town.name }),
    (item) => item.id,
    newestFirst
  )
}

/** Agenda del ámbito. Mismo criterio que `listScopeNews`. */
export function listScopeEvents(
  territory: Territory,
  params: Omit<ListEventsParams, 'poblacion'> = {}
): Promise<ScopeListing<AgendaEvent>> {
  return listScope(
    territory,
    (town) => listMunicipalEvents({ ...params, poblacion: town.name }),
    (item) => item.id_unico_evento,
    soonestFirst
  )
}
