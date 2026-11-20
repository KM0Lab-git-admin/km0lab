/**
 * Código postal → municipio.
 *
 * Lo resuelve km0lab-api (`GET /towns/public?postal_code=`): un municipio
 * existe para la app cuando está dado de alta en el servidor, no en una
 * lista del front. La única excepción es el código de demostración, que
 * es un modo de la app y no un municipio real.
 */
import { getTerritory } from '../services/territory'

import { DEMO_TOWN_NAME, isDemoPostalCode } from './demoTown'

const cache = new Map<string, string | null>()

/**
 * Devuelve el nombre del municipio o `null` si el código postal no
 * pertenece a ningún municipio dado de alta. Lanza si el servidor no
 * responde, para que la pantalla distinga «no existe» de «no hay conexión».
 */
export async function lookupTown(postalCode: string): Promise<string | null> {
  const cp = postalCode.trim()
  if (!/^\d{5}$/.test(cp)) return null
  if (isDemoPostalCode(cp)) return DEMO_TOWN_NAME
  if (cache.has(cp)) return cache.get(cp) ?? null
  // La misma pregunta que hace `useTerritory`: se comparte la respuesta.
  const territory = await getTerritory(cp)
  const name = territory?.scopeName.trim() || null
  cache.set(cp, name)
  return name
}
