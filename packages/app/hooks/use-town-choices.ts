/**
 * Poblaciones entre las que se elige en la demostración.
 *
 * Costura con Lovable (`src/hooks/use-town-choices.ts`); misma forma, con
 * el servicio real (`services/townChoices.ts`). Lo recordado se pinta
 * primero y una petición en segundo plano lo pone al día; su fallo solo se
 * enseña cuando no hay nada recordado.
 */
import { useQuery } from '@tanstack/react-query'

import { getCachedTownChoices, listTownChoices } from '../services/townChoices'

import type { TownChoice } from '../types/territory'

const TEN_MINUTES = 10 * 60_000

export function useTownChoices(enabled = true): {
  choices: TownChoice[]
  loading: boolean
  error: string | null
  reload: () => void
} {
  const query = useQuery({
    queryKey: ['town-choices'],
    queryFn: listTownChoices,
    enabled,
    retry: false,
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES,
    initialData: () => getCachedTownChoices() ?? undefined,
    initialDataUpdatedAt: 0,
  })
  const hasData = query.data !== undefined
  return {
    choices: query.data ?? [],
    loading: !hasData && enabled && query.isFetching,
    error: hasData ? null : (query.error?.message ?? null),
    reload: () => {
      void query.refetch()
    },
  }
}
