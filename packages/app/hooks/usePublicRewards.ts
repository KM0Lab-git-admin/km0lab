import { useMemo } from 'react'

import { useHomeRewards } from './useHomeRewards'

import type { ApiReward } from '../services/rewardsApi'

/**
 * usePublicRewards — premios activos del municipio elegido.
 *
 * Costura con Lovable (allí pasa por su intermediario). Aquí salen de
 * `GET /rewards/public` por código postal, con el cliente común y el
 * adaptador de premios. Sin código postal → vacío.
 */
export function usePublicRewards(): {
  rewards: ApiReward[]
  loading: boolean
  error: boolean
  reload: () => void
} {
  const { rewards, loading, error, reload } = useHomeRewards()
  const adapted = useMemo<ApiReward[]>(
    () => rewards.map((r) => ({ ...r, imageUrl: r.imageUrl ?? null })),
    [rewards]
  )
  return { rewards: adapted, loading, error: error !== null, reload }
}
