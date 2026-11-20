import { t, requestOtp, useAppStore } from '@km0lab/app'
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { HomeTab } from '@/components/BottomTabs'
import type { AccountAccessTarget } from '@km0lab/app'

import AccountAccessSheet from '@/components/AccountAccessSheet'
import { useLang } from '@/contexts/LangContext'

const DESTINATIONS: Record<AccountAccessTarget, string> = {
  points: '/points-history',
  rewards: '/redeemed-rewards',
  profile: '/profile',
}

export interface AccountAccessControls {
  target: AccountAccessTarget | null
  submitting: boolean
  error: string | null
  open: (tab?: HomeTab) => void
  close: () => void
  continueWithEmail: (email: string) => Promise<void>
  login: () => void
}

interface AccountAccessFlowProps {
  isAuthed: boolean
  container: HTMLElement | null
  children: (access: AccountAccessControls) => ReactNode
}

/** Presentation-owned account flow, shared by locked tabs and reward CTAs. */
const AccountAccessFlow = ({
  isAuthed,
  container,
  children,
}: AccountAccessFlowProps) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useLang()
  const [target, setTarget] = useState<AccountAccessTarget | null>(() => {
    const access = searchParams.get('access')
    return !isAuthed &&
      (access === 'points' || access === 'rewards' || access === 'profile')
      ? access
      : null
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = useRef(false)
  const requestVersion = useRef(0)

  const close = () => {
    requestVersion.current += 1
    busy.current = false
    setSubmitting(false)
    setError(null)
    setTarget(null)
    if (searchParams.has('access')) {
      const next = new URLSearchParams(searchParams)
      next.delete('access')
      setSearchParams(next, { replace: true })
    }
  }

  const open = (tab?: HomeTab) => {
    if (tab !== 'puntos' && tab !== 'rewards' && tab !== 'perfil') {
      navigate('/login')
      return
    }
    setError(null)
    setTarget(
      tab === 'puntos' ? 'points' : tab === 'perfil' ? 'profile' : 'rewards'
    )
  }

  const continueWithEmail = async (email: string) => {
    if (!target || isAuthed || busy.current) return
    busy.current = true
    const version = ++requestVersion.current
    const returnTo = DESTINATIONS[target]
    setSubmitting(true)
    setError(null)
    try {
      const { postalCode, town } = useAppStore.getState()
      const result = await requestOtp(email, {
        postal_code: postalCode ?? undefined,
        town: town ?? undefined,
      })
      if (version !== requestVersion.current) return
      if (result.error) {
        setError(t('login.error_email', lang))
        return
      }
      navigate('/check-email', { state: { email, mode: 'signup', returnTo } })
    } catch {
      if (version === requestVersion.current)
        setError(t('login.error_email', lang))
    } finally {
      if (version === requestVersion.current) {
        busy.current = false
        setSubmitting(false)
      }
    }
  }

  const login = () => {
    if (target)
      navigate(`/login?returnTo=${encodeURIComponent(DESTINATIONS[target])}`)
  }
  const access = {
    target: isAuthed ? null : target,
    submitting,
    error,
    open,
    close,
    continueWithEmail,
    login,
  }
  return (
    <>
      {children(access)}
      <AccountAccessSheet
        target={access.target}
        lang={lang}
        container={container}
        submitting={submitting}
        error={error}
        onClose={close}
        onContinue={continueWithEmail}
        onLogin={login}
      />
    </>
  )
}

export default AccountAccessFlow
