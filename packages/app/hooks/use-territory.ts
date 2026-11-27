/**
 * Territorio del vecino. Costura con Lovable (`src/hooks/use-territory.ts`);
 * misma forma, con el servicio real (`services/territory.ts`).
 */
import { useQuery } from '@tanstack/react-query'

import { getTerritory, resolveTerritory } from '../services/territory'
import { useAppStore } from '../stores/useAppStore'
import { showcaseTerritory } from '../utils/showcase'

import { useLocationContext } from './use-location-context'

import type { Town } from '../types/territory'

export function useTerritory() {
  const { postalCode } = useLocationContext()
  // Demostración: el territorio es la población o agrupación elegida en la
  // lista, no el de Demo KM0. No hace falta preguntar al servidor: la lista
  // ya traía nombres, códigos postales e ilustraciones.
  const choice = useAppStore((s) => s.showcaseChoice)
  const homeTownId = useAppStore((s) => s.showcaseHomeTownId)
  const showcase = showcaseTerritory(choice, homeTownId)
  const query = useQuery({
    queryKey: ['territory', postalCode],
    queryFn: () => getTerritory(postalCode),
    placeholderData: () => resolveTerritory(postalCode),
    enabled: showcase === null,
    staleTime: Infinity,
    refetchOnMount: 'always',
  })
  const territory = showcase ?? query.data ?? null
  const homeTown =
    territory?.towns.find((town) => town.id === territory.homeTownId) ?? null
  const nearbyTowns =
    territory?.towns.filter((town) => town.id !== territory.homeTownId) ?? []
  return {
    territory,
    homeTown,
    nearbyTowns,
    isGrouped: nearbyTowns.length > 0,
    loading: showcase === null && query.isLoading,
    error: showcase === null ? (query.error?.message ?? null) : null,
    reload: () => {
      void query.refetch()
    },
  }
}

/** Territorio de un código postal que aún no está guardado (su confirmación). */
export function useTerritoryFor(postalCode: string | null) {
  const query = useQuery({
    queryKey: ['territory', postalCode],
    queryFn: () => getTerritory(postalCode ?? ''),
    placeholderData: () => (postalCode ? resolveTerritory(postalCode) : null),
    enabled: postalCode !== null,
    staleTime: Infinity,
    refetchOnMount: 'always',
  })
  const territory = query.data ?? null
  return {
    territory,
    homeTown:
      territory?.towns.find((town) => town.id === territory.homeTownId) ?? null,
    nearbyTowns:
      territory?.towns.filter((town) => town.id !== territory.homeTownId) ?? [],
    loading: query.isLoading && postalCode !== null,
    error: query.error?.message ?? null,
    reload: () => {
      void query.refetch()
    },
  }
}

/** Cambia la población del vecino; el saldo y la cuenta no se tocan. */
export function useSetHomeTown(): (town: Town) => void {
  const setLocation = useAppStore((s) => s.setLocation)
  const setShowcase = useAppStore((s) => s.setShowcase)
  const choice = useAppStore((s) => s.showcaseChoice)
  return (town) => {
    // En la demostración se cambia la población que se ve; el código postal
    // sigue siendo el de Demo KM0. Guardar el de la población elegida
    // sacaría a quien prueba la demo a un pueblo de verdad.
    if (choice) setShowcase(choice, town.id)
    else setLocation(town.postalCodes[0] ?? null, town.name)
  }
}
