import {
  useAuth,
  useAppStore,
  t,
  getMyInviteLink,
  useInviteRewards,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  Loader2,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import BottomTabs from '@/components/BottomTabs'
import DeviceShell from '@/components/DeviceShell'
import ShareChannelList from '@/components/ShareChannelList'
import { useLang } from '@/contexts/LangContext'
import {
  buildInviteLink,
  buildPublicShareLink,
  type InviteKind,
} from '@/data/inviteConfig'
import { cn } from '@/lib/utils'

/** Identificador de la demo: `/home-registered` fuerza el estado registrado
 *  sin sesión real (misma convención que RequireAuth y las otras pantallas). */
const PREVIEW_USER_ID = 'preview-user'

const Invite = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const town = useAppStore((state) => state.town)
  const [kind, setKind] = useState<InviteKind>('person')
  const rewards = useInviteRewards()
  const [code, setCode] = useState<string | null>(null)
  const [linkFailed, setLinkFailed] = useState(false)
  const forcedState = searchParams.get('state')

  const previewAuthed = useMemo(
    () =>
      typeof window !== 'undefined' &&
      sessionStorage.getItem('km0_preview_authed') === '1',
    []
  )

  // Quién invita: sesión real o, en la demo, el usuario simulado de
  // `/home-registered`. Nunca un valor aleatorio sin asociación.
  const userId = user?.id ?? (previewAuthed ? PREVIEW_USER_ID : null)
  const isAuthed = Boolean(userId)
  const loginPath = '/login?returnTo=%2Finvite'

  const townLabel = town ?? t('share.town_fallback', lang)

  useEffect(() => {
    if (!user?.id) {
      setCode(null)
      setLinkFailed(false)
      return
    }
    let active = true
    setLinkFailed(false)
    getMyInviteLink(kind)
      .then((row) => {
        if (active) setCode(row.public_code)
      })
      .catch(() => {
        if (active) setLinkFailed(true)
      })
    return () => {
      active = false
    }
  }, [user?.id, kind])

  /** Enlace personal con atribución (sesión) o enlace público (sin sesión). */
  const link = useMemo(() => {
    if (typeof window === 'undefined') return ''
    if (!userId) return buildPublicShareLink(town, lang)
    if (!code) return ''
    return buildInviteLink({
      kind,
      reference: code,
      town,
      lang,
    })
  }, [userId, kind, town, lang, code])

  const message = isAuthed
    ? t(
        kind === 'person'
          ? 'invite.share.person_text'
          : 'invite.share.business_text',
        lang
      ).replace('{link}', link)
    : t('share.message', lang)
        .replace('{town}', townLabel)
        .replace('{link}', link)
  const subject = t('share.email_subject', lang).replace('{town}', townLabel)

  const renderLoading = () => (
    <div className="flex min-h-full items-center justify-center">
      <Loader2
        className="animate-spin text-km0-blue-700"
        aria-label={t('common.loading', lang)}
      />
    </div>
  )

  const renderError = (
    titleKey: 'invite.error.title' | 'invite.session.expired.title'
  ) => (
    <section className="flex min-h-full flex-col items-center justify-center text-center">
      <AlertCircle className="text-km0-coral-400" size={40} aria-hidden />
      <h2 className="mt-3 font-brand text-xl font-black text-km0-blue-900">
        {t(titleKey, lang)}
      </h2>
      <p className="mt-2 font-body text-sm text-km0-blue-800/70">
        {t(
          titleKey === 'invite.error.title'
            ? 'invite.error.description'
            : 'invite.session.expired.description',
          lang
        )}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          titleKey === 'invite.error.title'
            ? navigate('/invite', { replace: true })
            : navigate(loginPath)
        }
        className="mt-4 border-km0-blue-100 font-ui font-bold text-km0-blue-800"
      >
        <RefreshCw aria-hidden />
        {t(
          titleKey === 'invite.error.title'
            ? 'invite.error.retry'
            : 'share.login',
          lang
        )}
      </Button>
    </section>
  )

  const renderAuthed = () => (
    <div className="flex flex-col gap-6">
      <div
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-label={t('invite.home.title', lang)}
      >
        {(['person', 'business'] as const).map((option) => {
          const selected = kind === option
          const Icon = option === 'person' ? UserRound : Building2
          return (
            <Button
              key={option}
              type="button"
              variant="outline"
              role="radio"
              aria-checked={selected}
              onClick={() => setKind(option)}
              className={cn(
                'flex h-auto w-full items-center gap-3 whitespace-normal rounded-2xl border-2 bg-card p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-km0-yellow-400' : 'border-km0-blue-100'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  selected
                    ? 'bg-km0-yellow-100 text-km0-blue-900'
                    : 'bg-km0-blue-50 text-km0-blue-700'
                )}
              >
                <Icon aria-hidden size={20} />
              </span>
              <span className="min-w-0 flex-1 font-ui text-sm font-bold text-km0-blue-900">
                {t(`invite.select.${option}`, lang)}
              </span>
              <span className="shrink-0 rounded-full bg-km0-teal-100 px-2 py-1 font-ui text-xs font-black text-km0-teal-700">
                +{rewards[option]} {t('common.points', lang)}
              </span>
            </Button>
          )
        })}
      </div>

      <p className="rounded-xl bg-km0-beige-100 px-3 py-3 font-body text-xs leading-snug text-km0-blue-800/80">
        {t(`invite.explain.${kind}`, lang).replace(
          '{points}',
          String(rewards[kind])
        )}
      </p>

      <section>
        <h2 className="font-ui text-sm font-bold text-km0-blue-900">
          {t('invite.channels.title', lang)}
        </h2>
        <div className="mt-2">
          <ShareChannelList
            link={link}
            message={message}
            subject={subject}
            inviteCode={code}
          />
        </div>
      </section>

      <button
        type="button"
        onClick={() =>
          navigate('/my-invitations?from=actions', {
            state: { invitationOrigin: 'actions' },
          })
        }
        className="self-start font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
      >
        {t('invites.link', lang)}
      </button>
    </div>
  )

  const renderGuest = () => (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl bg-km0-beige-100 px-3 py-3 font-body text-xs leading-snug text-km0-blue-800/80">
        {t('share.panel.notice', lang)}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => navigate(loginPath)}
          className="font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
        >
          {t('share.create_account', lang)}
        </button>
        <button
          type="button"
          onClick={() => navigate(loginPath)}
          className="font-ui text-xs font-bold text-km0-blue-800/70 underline underline-offset-2"
        >
          {t('share.login', lang)}
        </button>
      </div>
      <section>
        <h2 className="font-ui text-sm font-bold text-km0-blue-900">
          {t('share.panel.how', lang)}
        </h2>
        <div className="mt-2">
          <ShareChannelList
            link={link}
            message={message}
            subject={subject}
            inviteCode={code}
          />
        </div>
      </section>
    </div>
  )

  const renderMain = () => {
    if (
      loading ||
      forcedState === 'loading' ||
      (isAuthed && !link && !linkFailed)
    )
      return renderLoading()
    if (forcedState === 'error' || linkFailed)
      return renderError('invite.error.title')
    if (forcedState === 'expired')
      return renderError('invite.session.expired.title')
    return isAuthed ? renderAuthed() : renderGuest()
  }

  return (
    <DeviceShell>
      <div className="flex h-full w-full justify-center overflow-hidden bg-km0-beige-50">
        <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-km0-beige-50">
          <header className="shrink-0 border-b border-km0-blue-100 bg-card px-3 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label={t('common.back', lang)}
                className="shrink-0 rounded-xl border-km0-blue-100"
              >
                <ChevronLeft aria-hidden />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-brand text-xl font-black text-km0-blue-900">
                  {t(isAuthed ? 'invite.home.title' : 'share.title', lang)}
                </h1>
                <p className="font-body text-xs text-km0-blue-800/65">
                  {t(
                    isAuthed
                      ? 'invite.header.subtitle'
                      : 'share.home.description',
                    lang
                  )}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4">
            {renderMain()}
          </main>

          <BottomTabs
            activeTab="actions"
            isAuthed={isAuthed}
            onLogin={() => navigate(loginPath)}
            onHome={() => navigate('/home')}
            onProfile={() => navigate('/profile')}
            onPoints={() => navigate('/points-history')}
            onRewards={() => navigate('/redeemed-rewards')}
            onActions={() => navigate('/points-actions')}
          />
        </div>
      </div>
    </DeviceShell>
  )
}

export default Invite
