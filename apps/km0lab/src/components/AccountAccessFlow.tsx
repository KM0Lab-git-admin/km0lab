import { t, requestOtp, loginWithProvider, useAppStore } from '@km0lab/app'
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { HomeTab } from '@/components/BottomTabs'
import type {
  AccountAccessTarget,
  AccessError,
  AccessProvider,
} from '@km0lab/app'

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
  continueWithEmail: (
    email: string,
    referralReference?: string | null
  ) => Promise<void>
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
  const [busyProvider, setBusyProvider] = useState<AccessProvider | null>(null)
  const [socialError, setSocialError] = useState<{
    provider: AccessProvider
    error: AccessError
  } | null>(null)
  const [pilotFull, setPilotFull] = useState(false)
  const [emailRequestProvider, setEmailRequestProvider] =
    useState<AccessProvider | null>(null)
  const busy = useRef(false)
  const requestVersion = useRef(0)

  const close = () => {
    requestVersion.current += 1
    busy.current = false
    setSubmitting(false)
    setError(null)
    setTarget(null)
    setBusyProvider(null)
    setSocialError(null)
    setPilotFull(false)
    setEmailRequestProvider(null)
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
    setSocialError(null)
    setPilotFull(false)
    setEmailRequestProvider(null)
    setTarget(
      tab === 'puntos' ? 'points' : tab === 'perfil' ? 'profile' : 'rewards'
    )
  }

  const continueWithEmail = async (
    email: string,
    referralReference?: string | null
  ) => {
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
      if (result.error?.code === 'pilot_full') {
        setPilotFull(true)
        return
      }
      if (result.error) {
        setError(
          t(
            result.error.code === 'offline'
              ? 'access.offline'
              : result.error.code === 'ip_limited'
                ? 'access.email.ip_limited'
                : 'access.email.send_failed',
            lang
          )
        )
        return
      }
      navigate('/check-email', {
        state: {
          email,
          mode: 'signup',
          returnTo,
          ...(referralReference ? { referralReference } : {}),
        },
      })
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

  const continueWithProvider = async (
    provider: AccessProvider,
    referralReference: string | null
  ) => {
    if (!target || isAuthed || busy.current) return
    busy.current = true
    const version = ++requestVersion.current
    const destination = DESTINATIONS[target]
    setBusyProvider(provider)
    setSocialError(null)
    try {
      const result = await loginWithProvider(provider, { referralReference })
      if (version !== requestVersion.current || result.cancelled) return
      if (result.error?.code === 'pilot_full') {
        setPilotFull(true)
        return
      }
      if (result.error?.code === 'email_missing') {
        setError(null)
        setEmailRequestProvider(provider)
        return
      }
      if (result.error) {
        setSocialError({ provider, error: result.error })
        return
      }
      navigate(destination, { replace: true })
    } catch {
      if (version === requestVersion.current)
        setSocialError({
          provider,
          error: { code: 'provider_failed', message: 'Provider unavailable' },
        })
    } finally {
      if (version === requestVersion.current) {
        busy.current = false
        setBusyProvider(null)
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
        busyProvider={busyProvider}
        socialError={socialError}
        pilotFull={pilotFull}
        emailRequestProvider={emailRequestProvider}
        onBackToDoors={() => {
          setEmailRequestProvider(null)
          setError(null)
        }}
        onProvider={continueWithProvider}
        onExplore={() => navigate('/home')}
      />
    </>
  )
}

export default AccountAccessFlow
