import { useCallback, useEffect } from 'react'

import { onAccountChanged } from '../services/accountEvents'

import { useMyRedemptions } from './useMyRedemptions'
import { usePointsHistory } from './usePointsHistory'

import type { PointsTransaction } from '../types/points'
import type { Redemption } from '../types/redemption'

export interface AccountResult {
  balance: number
  earned: number
  spent: number
  transactions: PointsTransaction[]
  redemptions: Redemption[]
  loading: boolean
  error: string | null
  reload: () => void
}

/**
 * useAccount — cuenta del vecino con sesión: saldo, movimientos y canjes.
 *
 * Costura con Lovable (allí `src/hooks/use-account.ts`, con datos de
 * ejemplo). Aquí todo sale de km0lab-api: `GET /points/me/history` y
 * `GET /redemptions` (cruzado con el catálogo para título e imagen).
 * Sin sesión devuelve la cuenta vacía.
 */
export function useAccount(): AccountResult {
  const history = usePointsHistory()
  const redeemed = useMyRedemptions()
  const reloadHistory = history.reload
  const reloadRedemptions = redeemed.reload

  const reload = useCallback(() => {
    reloadHistory()
    reloadRedemptions()
  }, [reloadHistory, reloadRedemptions])

  useEffect(() => onAccountChanged(reload), [reload])

  return {
    balance: history.history.balance,
    earned: history.history.earnedTotal,
    spent: history.history.spentTotal,
    transactions: history.history.items,
    redemptions: redeemed.redemptions,
    loading: history.loading || redeemed.loading,
    error: history.error ?? redeemed.error,
    reload,
  }
}
