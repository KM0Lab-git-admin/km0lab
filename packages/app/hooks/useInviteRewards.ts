import { useCallback, useEffect, useState } from 'react'

import { listPublicActions } from '../services/points'
import { INVITE_REWARDS } from '../data/inviteConfig'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'

export function useInviteRewards(): { person: number; business: number } {
  const postalCode = useAppStore((s) => s.postalCode)
  const lang = useAppStore((s) => s.lang)
  const [rewards, setRewards] = useState<{ person: number; business: number }>({
    person: INVITE_REWARDS.person,
    business: INVITE_REWARDS.business,
  })

  useEffect(() => {
    if (!postalCode) return
    let cancelled = false
    listPublicActions(postalCode, {
      lang,
      demo: isDemoPostalCode(postalCode),
    })
      .then((rows) => {
        if (cancelled) return
        const person = rows.find((a) => a.type === 'invite_person')
        const business = rows.find((a) => a.type === 'invite_business')
        setRewards({
          person: person?.points ?? INVITE_REWARDS.person,
          business: business?.points ?? INVITE_REWARDS.business,
        })
      })
      .catch(() => {
        /* keep fallback constants */
      })
    return () => {
      cancelled = true
    }
  }, [postalCode, lang])

  return rewards
}

export function useInviteLinkReload(): { tick: number; reload: () => void } {
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { tick, reload }
}
