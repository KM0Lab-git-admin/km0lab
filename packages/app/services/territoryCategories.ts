/**
 * Categorías de agenda del ámbito: las de cada población, sin repetir.
 * Costura con Lovable (`src/services/territoryCategories.ts`), sin su
 * fuente de muestra.
 */
import { getCategories } from './eventsApi'

import type { Territory } from '../types/territory'

type Categories = Awaited<ReturnType<typeof getCategories>>

export async function listScopeCategories(
  territory: Territory
): Promise<Categories> {
  const results = await Promise.allSettled(
    territory.towns.map((town) => getCategories(town.name))
  )
  const categories = new Map<string, Categories[number]>()
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const category of result.value) {
      if (!categories.has(category.slug))
        categories.set(category.slug, category)
    }
  }
  return [...categories.values()]
}
