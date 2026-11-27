import { useCallback, useEffect, useState } from 'react'

import { getMyInviteSummary, NO_FRIEND_LIMIT } from '../services/invites'
import { listPublicActions } from '../services/points'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'

export interface InviteRewards {
  /** Puntos por cada amigo premiado. 0 si el municipio no premia invitar. */
  person: number
  /** A cuántos amigos se premia. 0 = invitar no suma puntos. */
  friendLimit: number
}

/**
 * useInviteRewards — qué se gana por invitar y hasta cuántos amigos.
 *
 * Costura con Lovable (`src/hooks/use-invite-rewards.ts`, que allí lee datos
 * de ejemplo). Aquí todo sale de km0lab-api, por municipio:
 * - Los puntos y el tope general, de la acción «invitar a un vecino» de
 *   `GET /actions/public` (su «límite por usuario»). Si la acción está
 *   apagada o no existe, invitar no suma: 0 y 0.
 * - Con sesión, el tope es el que el servidor dice para esa persona
 *   (`GET /invites/me/summary`), que es quien decide.
 * Mientras no llega la respuesta no se promete nada: 0 puntos.
 */
export function useInviteRewards(): InviteRewards {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const token = useAppStore((s) => s.token)
  const [rewards, setRewards] = useState<InviteRewards>({
    person: 0,
    friendLimit: 0,
  })

  useEffect(() => {
    if (!postalCode) return
    let cancelled = false
    const publicRules = listPublicActions(postalCode, {
      lang,
      demo: isDemoPostalCode(postalCode),
    }).then((rows) => {
      const action = rows.find((a) => a.type === 'invite_person' && a.active)
      return action
        ? {
            person: action.points,
            friendLimit: action.per_user_limit ?? NO_FRIEND_LIMIT,
          }
        : { person: 0, friendLimit: 0 }
    })
    const own = token
      ? getMyInviteSummary()
          .then((summary) => summary.friendLimit)
          .catch(() => null)
      : Promise.resolve(null)
    Promise.all([publicRules, own])
      .then(([rules, ownLimit]) => {
        if (cancelled) return
        setRewards({
          person: rules.person,
          friendLimit: rules.person > 0 ? (ownLimit ?? rules.friendLimit) : 0,
        })
      })
      .catch(() => {
        /* sin respuesta no se promete nada */
      })
    return () => {
      cancelled = true
    }
  }, [postalCode, lang, token])

  return rewards
}

export function useInviteLinkReload(): { tick: number; reload: () => void } {
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { tick, reload }
}
