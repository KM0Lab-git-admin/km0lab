/**
 * Catálogo CP → población.
 *
 * Fase actual: mock en TS (`src/data/mockPostalCodes.ts`).
 * Cuando se monte la BD real, sustituir el cuerpo de `lookupTown()` por
 * la query correspondiente — la firma async se mantiene a propósito.
 */
import { MOCK_POSTAL_CODES } from '../data/mockPostalCodes'
import { DEMO_TOWN_NAME, isDemoPostalCode } from './demoTown'

const cache = new Map<string, string | null>()

export async function lookupTown(postalCode: string): Promise<string | null> {
  const cp = postalCode.trim()
  if (!/^\d{5}$/.test(cp)) return null
  if (cache.has(cp)) return cache.get(cp) ?? null

  // Simula latencia de red mínima para mantener los estados de loading.
  await new Promise((r) => setTimeout(r, 120))
  // 00000 es producción (Demo KM0). El mock de Lovable no lo trae y el
  // sync lo borra; no depende de ese diccionario.
  const town = isDemoPostalCode(cp)
    ? DEMO_TOWN_NAME
    : (MOCK_POSTAL_CODES[cp] ?? null)
  cache.set(cp, town)
  return town
}
