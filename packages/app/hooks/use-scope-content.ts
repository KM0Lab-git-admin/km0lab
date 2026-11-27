/**
 * Noticias, agenda y categorías del ámbito del vecino.
 *
 * Costuras con Lovable (`use-scope-news`, `use-scope-events`,
 * `use-scope-categories`). Allí aceptan una fuente «de muestra»; en
 * producción solo existe la real: nada de contenido de ejemplo.
 */
import { useQuery } from '@tanstack/react-query'

import { listScopeEvents, listScopeNews } from '../services/municipalListings'
import { listScopeCategories } from '../services/territoryCategories'

import { useTerritory } from './use-territory'

import type { AgendaEvent, ListEventsParams } from '../services/eventsApi'
import type { ListNewsParams, Noticia } from '../services/newsApi'
import type { ScopeListing } from '../types/territory'

const EMPTY = { home: [], nearby: [], failedTownIds: [] }

export function useScopeNews(params: Omit<ListNewsParams, 'city'> = {}) {
  const {
    territory,
    loading: territoryLoading,
    error: territoryError,
    reload: reloadTerritory,
  } = useTerritory()
  const query = useQuery<ScopeListing<Noticia>>({
    queryKey: [
      'scope-news',
      territory?.scopeId,
      territory?.homeTownId,
      territory?.towns.map((town) => town.id),
      params,
    ],
    queryFn: () =>
      territory ? listScopeNews(territory, params) : Promise.resolve(EMPTY),
    enabled: territory !== null,
    staleTime: 300000,
  })
  return {
    home: query.data?.home ?? [],
    nearby: query.data?.nearby ?? [],
    failedTownIds: query.data?.failedTownIds ?? [],
    loading: territoryLoading || (territory !== null && query.isLoading),
    error: territoryError ?? query.error?.message ?? null,
    reload: () => {
      if (territoryError !== null) reloadTerritory()
      else void query.refetch()
    },
  }
}

export function useScopeEvents(
  params: Omit<ListEventsParams, 'poblacion'> = {}
) {
  const {
    territory,
    loading: territoryLoading,
    error: territoryError,
    reload: reloadTerritory,
  } = useTerritory()
  const query = useQuery<ScopeListing<AgendaEvent>>({
    queryKey: [
      'scope-events',
      territory?.scopeId,
      territory?.homeTownId,
      territory?.towns.map((town) => town.id),
      params,
    ],
    queryFn: () =>
      territory ? listScopeEvents(territory, params) : Promise.resolve(EMPTY),
    enabled: territory !== null,
    staleTime: 300000,
  })
  return {
    home: query.data?.home ?? [],
    nearby: query.data?.nearby ?? [],
    failedTownIds: query.data?.failedTownIds ?? [],
    loading: territoryLoading || (territory !== null && query.isLoading),
    error: territoryError ?? query.error?.message ?? null,
    reload: () => {
      if (territoryError !== null) reloadTerritory()
      else void query.refetch()
    },
  }
}

export function useScopeCategories() {
  const { territory, loading, error, reload } = useTerritory()
  const query = useQuery({
    queryKey: [
      'scope-categories',
      territory?.scopeId,
      territory?.towns.map((town) => town.id),
    ],
    queryFn: () =>
      territory ? listScopeCategories(territory) : Promise.resolve([]),
    enabled: territory !== null,
    staleTime: 300000,
  })
  return {
    categories: query.data ?? [],
    loading: loading || (territory !== null && query.isLoading),
    error: error ?? query.error?.message ?? null,
    reload: () => {
      if (error) reload()
      else void query.refetch()
    },
  }
}
