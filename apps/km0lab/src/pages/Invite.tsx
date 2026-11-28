import {
  useLocationContext,
  useDragScroll,
  useAuth,
  useInviteLink,
  useInvitations,
  getFriendProgress,
  useInviteRewards,
  t,
  tf,
} from '@km0lab/app'
import { Button, Progress } from '@km0lab/ui'
import { AlertCircle, Copy, Info, Loader2, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import BottomTabs from '@/components/AccountBottomTabs'
import ScreenHeader from '@/components/ScreenHeader'
import ShareChannelList from '@/components/ShareChannelList'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/** Identificador de la demo: `/home-registered` fuerza el estado registrado
 *  sin sesión real (misma convención que RequireAuth y las otras pantallas). */
const PREVIEW_USER_ID = 'preview-user'
/** Above this many rewarded friends the bar becomes continuous. */
const MAX_SEGMENTS = 10

const Invite = () => {
  const navigate = useNavigate()
  const inviteRewards = useInviteRewards()
  const scrollRef = useDragScroll('vertical')
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const { town } = useLocationContext()
  const {
    link: inviteLink,
    code,
    loading: linkLoading,
    error: linkError,
    reload,
  } = useInviteLink()
  const { records, summary, loading: invitationsLoading } = useInvitations()
  const progress = getFriendProgress(summary)
  const inProgressCount = records.filter(
    (record) => record.status === 'started'
  ).length
  const link = inviteLink ?? ''
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

  const message = isAuthed
    ? t('invite.share.person_text', lang).replace('{link}', link)
    : t('share.message', lang)
        .replace('{town}', townLabel)
        .replace('{link}', link)
  const subject = t(
    isAuthed ? 'invite.title' : 'share.email_subject',
    lang
  ).replace('{town}', townLabel)

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
            ? (reload(), navigate('/invite', { replace: true }))
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

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      toast.success(t('invite.code.copied', lang))
    } catch {
      toast.error(t('invite.code.copy_failed', lang))
    }
  }

  const renderProgressBar = () =>
    progress.limit <= MAX_SEGMENTS ? (
      <div className="mt-2 flex gap-1" aria-hidden>
        {Array.from({ length: progress.limit }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-2 flex-1 rounded-full',
              index < progress.count ? 'bg-km0-teal-600' : 'bg-km0-blue-100'
            )}
          />
        ))}
      </div>
    ) : (
      <Progress
        value={(progress.count / progress.limit) * 100}
        className="mt-2 h-2 bg-km0-blue-100"
        aria-hidden
      />
    )

  const renderStatus = () => {
    if (!progress.rewarding) {
      return (
        <p
          role="note"
          className="flex items-start gap-2 rounded-xl bg-km0-yellow-100 px-3 py-3 font-body text-sm leading-snug text-km0-blue-900"
        >
          <Info aria-hidden size={16} className="mt-0.5 shrink-0" />
          {t('invite.friend.no_points', lang)}
        </p>
      )
    }
    return (
      <>
        <section
          className="rounded-2xl border border-km0-blue-100 bg-card p-3"
          data-testid="invite-friend-status"
        >
          <p className="font-ui text-sm font-bold text-km0-blue-900">
            {progress.reached
              ? tf(
                  progress.limit === 1
                    ? 'invite.friend.limit_reached.one'
                    : 'invite.friend.limit_reached.other',
                  lang,
                  { limit: progress.limit }
                )
              : tf('invite.friend.progress', lang, {
                  count: progress.count,
                  limit: progress.limit,
                })}
          </p>
          {renderProgressBar()}
          {inProgressCount > 0 ? (
            <p className="mt-2 font-body text-xs text-km0-blue-800/65">
              {tf(
                inProgressCount === 1
                  ? 'invite.friend.in_progress.one'
                  : 'invite.friend.in_progress.other',
                lang,
                { count: inProgressCount }
              )}
            </p>
          ) : null}
          {progress.reached ? (
            <p className="mt-2 font-body text-xs text-km0-blue-800/80">
              {t('invite.friend.limit_reached_note', lang)}
            </p>
          ) : null}
        </section>
        <p className="rounded-xl bg-km0-beige-100 px-3 py-3 font-body text-xs leading-snug text-km0-blue-800/80">
          {tf(
            progress.limit === 1
              ? 'invite.friend.how.one'
              : 'invite.friend.how.other',
            lang,
            {
              points: inviteRewards.person,
              limit: progress.limit,
            }
          )}
        </p>
      </>
    )
  }

  const renderCode = () =>
    code ? (
      <section>
        <h2 className="font-ui text-sm font-bold text-km0-blue-900">
          {t('invite.code.title', lang)}
        </h2>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-km0-blue-100 bg-card p-2 pl-3">
          <span
            className="min-w-0 flex-1 truncate font-ui text-base font-black tracking-wide text-km0-blue-900"
            data-testid="invite-code"
          >
            {code}
          </span>
          <Button
            type="button"
            variant="bubbleSecondary"
            size="sm"
            onClick={copyCode}
            className="shrink-0"
          >
            <Copy aria-hidden />
            {t('invite.code.copy', lang)}
          </Button>
        </div>
        <p className="mt-1.5 font-body text-xs leading-snug text-km0-blue-800/65">
          {t('invite.code.help', lang)}
        </p>
      </section>
    ) : null

  const renderAuthed = () => (
    <div className="flex flex-col gap-6">
      {progress.rewarding ? (
        <p className="self-start rounded-full bg-km0-teal-100 px-3 py-1 font-ui text-xs font-black text-km0-teal-700">
          {tf('invite.friend.badge', lang, { points: inviteRewards.person })}
        </p>
      ) : null}

      {renderStatus()}

      <section>
        <h2 className="font-ui text-sm font-bold text-km0-blue-900">
          {t('invite.channels.title', lang)}
        </h2>
        <div className="mt-2">
          <ShareChannelList link={link} message={message} subject={subject} />
        </div>
      </section>

      {renderCode()}

      <Button
        variant="bubbleSurface"
        type="button"
        onClick={() =>
          navigate('/my-invitations?from=actions', {
            state: { invitationOrigin: 'actions' },
          })
        }
        className="self-start font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
      >
        {t('invites.link', lang)}
      </Button>
    </div>
  )

  const renderGuest = () => (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl bg-km0-beige-100 px-3 py-3 font-body text-xs leading-snug text-km0-blue-800/80">
        {t('share.panel.notice', lang)}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button
          variant="bubbleSurface"
          type="button"
          onClick={() => navigate(loginPath)}
          className="font-ui text-xs font-bold text-km0-blue-700 underline underline-offset-2"
        >
          {t('share.create_account', lang)}
        </Button>
        <Button
          variant="bubbleSurface"
          type="button"
          onClick={() => navigate(loginPath)}
          className="font-ui text-xs font-bold text-km0-blue-800/70 underline underline-offset-2"
        >
          {t('share.login', lang)}
        </Button>
      </div>
      <section>
        <h2 className="font-ui text-sm font-bold text-km0-blue-900">
          {t('share.panel.how', lang)}
        </h2>
        <div className="mt-2">
          <ShareChannelList link={link} message={message} subject={subject} />
        </div>
      </section>
    </div>
  )

  const renderMain = () => {
    if (
      loading ||
      linkLoading ||
      (isAuthed && invitationsLoading) ||
      forcedState === 'loading'
    )
      return renderLoading()
    if (linkError || forcedState === 'error')
      return renderError('invite.error.title')
    if (forcedState === 'expired')
      return renderError('invite.session.expired.title')
    if (isAuthed && !link) return renderError('invite.error.title')
    return isAuthed ? renderAuthed() : renderGuest()
  }

  return (
    <>
      <div className="flex h-full w-full justify-center overflow-hidden bg-km0-beige-50">
        <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-km0-beige-50">
          <ScreenHeader
            title={t(isAuthed ? 'invite.home.title' : 'share.title', lang)}
            onBack={() => navigate(-1)}
            backAriaLabel={t('common.back', lang)}
          />

          <main
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4"
          >
            <p className="mb-4 font-body text-sm text-km0-blue-800/65">
              {t(
                isAuthed ? 'invite.header.subtitle' : 'share.home.description',
                lang
              )}
            </p>
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
    </>
  )
}

export default Invite
