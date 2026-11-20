import { DEMO_TOWN_NAME, MALGRAT_CONTENT_TOWN } from '../utils/demoTown'

import {
  listEvents,
  type AgendaEvent,
  type ListEventsParams,
} from './eventsApi'
import { listNews, type ListNewsParams, type Noticia } from './newsApi'

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
