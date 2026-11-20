import type { AgendaEvent } from '../services/eventsApi'
import type { ComercAdherit } from '../types/comercAdherit'
import type { ScopedItem } from '../types/territory'

export const INITIAL_HOME_NEWS_LIMIT = 5

export function filterScopeTown<T>(
  items: ScopedItem<T>[],
  townId: string | null
): ScopedItem<T>[] {
  return townId === null
    ? items
    : items.filter((entry) => entry.town.id === townId)
}

export function countEventCategories(
  items: ScopedItem<AgendaEvent>[]
): Map<string, number> {
  const counts = new Map<string, number>()
  items.forEach(({ item }) =>
    new Set(item.tags).forEach((slug) =>
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    )
  )
  return counts
}

export function visibleHomeNews<T>(items: T[], expanded: boolean): T[] {
  return expanded ? items : items.slice(0, INITIAL_HOME_NEWS_LIMIT)
}

/** Search/category filters cover the entire scope unless a town is explicitly selected. */
export function filterShops(
  shops: ComercAdherit[],
  filters: { category: string; townId: string | null; search: string }
): ComercAdherit[] {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const search = normalize(filters.search.trim())
  return shops.filter(
    (shop) =>
      (filters.category === 'totes' ||
        shop.categoriaSlug === filters.category) &&
      (filters.townId === null || shop.townId === filters.townId) &&
      (!search ||
        normalize(
          `${shop.nom} ${shop.adreca} ${shop.townName ?? ''} ${shop.categoriaNom.ca} ${shop.categoriaNom.es}`
        ).includes(search))
  )
}
