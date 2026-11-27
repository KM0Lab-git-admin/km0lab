/**
 * Poblaciones entre las que se elige en la demostración (código 00000).
 *
 * Costura con Lovable (`listTownChoices` y `getCachedTownChoices` de
 * `src/services/townsApi.ts`, que allí lee UAT a través de un proxy). Aquí
 * sale de km0lab-api (`GET /towns`): qué poblaciones hay lo decide el
 * servidor, no una lista del front.
 *
 * La API repite un municipio que agrupa varias poblaciones una vez por
 * población; aquí se pliega en una sola opción («Baix Montseny: Breda,
 * Hostalric, Riells i Viabrea»). Un municipio de un solo pueblo es una
 * opción con una población.
 */
import { z } from 'zod'

import { apiFetch, townPublicOutSchema } from './km0labClient'
import { toTownArtUrl } from './territory'

import type { TownPublicOut } from './km0labClient'
import type { TownChoice, TownChoiceTown } from '../types/territory'

const STORAGE_KEY = 'km0_town_choices'

const townListSchema = z.array(townPublicOutSchema)

const sortKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/** Una opción por municipio, por orden alfabético sin acentos ni mayúsculas. */
export function toTownChoices(entries: TownPublicOut[]): TownChoice[] {
  const byMunicipality = new Map<string, TownPublicOut[]>()
  for (const entry of entries) {
    const key = entry.municipality_id ?? entry.id
    byMunicipality.set(key, [...(byMunicipality.get(key) ?? []), entry])
  }
  const choices: TownChoice[] = []
  for (const [id, group] of byMunicipality) {
    const first = group[0]
    if (!first) continue
    const localities = first.localities ?? []
    const isGroup = localities.length > 1 || group.length > 1
    const towns: TownChoiceTown[] =
      localities.length > 1
        ? localities.map((locality) => ({
            id: locality.id,
            name: locality.name,
            postalCodes: locality.postal_codes,
            artUrl: toTownArtUrl(locality.art_url),
          }))
        : group.map((entry) => ({
            id: entry.locality_id ?? entry.id,
            name: entry.name,
            postalCodes: entry.postal_codes ?? [],
            artUrl: toTownArtUrl(entry.art_url),
          }))
    choices.push({
      id,
      name: isGroup ? (first.municipality_name ?? first.name) : first.name,
      artUrl: towns[0]?.artUrl ?? null,
      towns,
    })
  }
  return choices.sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)))
}

/**
 * La última lista que dio el servidor, disponible al instante para pintar
 * sin espera. No es un dato de ejemplo: es memoria de una respuesta real,
 * y se vuelve a validar al leerla.
 */
export function getCachedTownChoices(): TownChoice[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = townListSchema.safeParse(JSON.parse(raw))
    return parsed.success ? toTownChoices(parsed.data) : null
  } catch {
    return null
  }
}

/** Poblaciones elegibles. Lanza si el servidor no responde o contesta mal. */
export async function listTownChoices(): Promise<TownChoice[]> {
  const entries = await apiFetch('/towns', { schema: townListSchema })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Sin almacenamiento la lista funciona igual; solo no se recuerda.
  }
  return toTownChoices(entries)
}
