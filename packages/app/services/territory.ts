/**
 * Territorio de un código postal: la población del vecino y, si las hay,
 * las poblaciones vecinas de su ámbito.
 *
 * Costura con Lovable (`src/services/territory.ts`, que allí se apoya en un
 * diccionario de ejemplo). En producción todo sale de km0lab-api
 * (`GET /towns/public?postal_code=`).
 *
 * La API todavía no agrupa poblaciones: cada código postal es un municipio
 * suelto. Por eso el territorio que se devuelve hoy tiene **una sola
 * población** y la interfaz de agrupación queda portada pero dormida
 * (`isGrouped` falso). El día que la API devuelva el ámbito, se rellena
 * aquí `towns` y no hay que tocar las pantallas.
 */
import { env } from '../utils/env'

import { ApiError } from './km0labClient'
import { getPublicTown } from './towns'

import type { Territory, Town } from '../types/territory'

const STORAGE_PREFIX = 'km0_territory:'

const isPostalCode = (value: string) => /^\d{5}$/.test(value)

/** La API da la ilustración como ruta relativa a ella misma. */
export const toTownArtUrl = (
  artUrl: string | null | undefined
): string | null => {
  if (!artUrl) return null
  try {
    return new URL(artUrl, `${env.km0labApiUrl}/`).href
  } catch {
    return null
  }
}

const remember = (postalCode: string, territory: Territory | null): void => {
  try {
    const key = `${STORAGE_PREFIX}${postalCode}`
    if (territory) localStorage.setItem(key, JSON.stringify(territory))
    else localStorage.removeItem(key)
  } catch {
    // Sin almacenamiento la app funciona igual; solo no recuerda.
  }
}

const isTown = (value: unknown): value is Town => {
  if (!value || typeof value !== 'object') return false
  const town = value as Partial<Town>
  return (
    typeof town.id === 'string' &&
    typeof town.name === 'string' &&
    Array.isArray(town.postalCodes)
  )
}

/**
 * Lo último que dijo el servidor para ese código postal, disponible al
 * instante. Evita el hueco (y el salto de la ilustración) mientras llega la
 * respuesta nueva. No es un dato de ejemplo: es memoria de una respuesta real.
 */
export function resolveTerritory(postalCode: string): Territory | null {
  const cp = postalCode.trim()
  if (!isPostalCode(cp)) return null
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${cp}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Territory>
    if (
      typeof parsed.scopeId !== 'string' ||
      typeof parsed.scopeName !== 'string' ||
      typeof parsed.homeTownId !== 'string' ||
      !Array.isArray(parsed.towns) ||
      !parsed.towns.every(isTown)
    ) {
      return null
    }
    return parsed as Territory
  } catch {
    return null
  }
}

/**
 * Respuestas recientes, por código postal. Confirmar un código postal pide
 * primero el nombre del pueblo y enseguida su territorio: es la misma
 * pregunta al servidor, y así se hace una sola vez.
 */
const RECENT_MS = 60_000
const recent = new Map<
  string,
  { at: number; value: Promise<Territory | null> }
>()

/** Solo para pruebas. */
export const resetTerritoryMemo = (): void => recent.clear()

/**
 * Territorio del código postal según el servidor, o `null` si no pertenece
 * a ningún municipio dado de alta. Lanza si el servidor no responde.
 */
export function getTerritory(postalCode: string): Promise<Territory | null> {
  const cp = postalCode.trim()
  if (!isPostalCode(cp)) return Promise.resolve(null)
  const hit = recent.get(cp)
  if (hit && Date.now() - hit.at < RECENT_MS) return hit.value
  const value = fetchTerritory(cp)
  recent.set(cp, { at: Date.now(), value })
  // Un fallo de red no se recuerda: el siguiente intento vuelve a preguntar.
  value.catch(() => {
    if (recent.get(cp)?.value === value) recent.delete(cp)
  })
  return value
}

async function fetchTerritory(cp: string): Promise<Territory | null> {
  try {
    const town = await getPublicTown(cp)
    const postalCodes =
      town.postal_codes && town.postal_codes.length > 0
        ? town.postal_codes
        : [cp]
    const home: Town = {
      id: town.id,
      name: town.name.trim(),
      postalCodes,
      artUrl: toTownArtUrl(town.art_url),
    }
    const territory: Territory = {
      scopeId: `town-${town.id}`,
      scopeName: home.name,
      homeTownId: home.id,
      towns: [home],
    }
    remember(cp, territory)
    return territory
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 422)) {
      remember(cp, null)
      return null
    }
    throw e
  }
}
