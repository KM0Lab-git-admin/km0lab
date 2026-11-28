import {
  useDragScroll,
  useAuth,
  t,
  tf,
  type Lang,
  type TKey,
  getFriendProgress,
  useInvitations,
  InvitationRecord,
  InvitationStatus,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Coins,
  Hourglass,
  Loader2,
  RefreshCw,
  Share2,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import type { HomeTab } from '@/components/BottomTabs'

import BottomTabs from '@/components/AccountBottomTabs'
import ScreenHeader from '@/components/ScreenHeader'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

type InvitationOrigin = 'home' | 'points' | 'actions'

const STATUS_STYLE: Record<InvitationStatus, string> = {
  started: 'bg-km0-beige-100 text-km0-blue-800',
  pending: 'bg-km0-yellow-100 text-km0-blue-900',
  granted: 'bg-km0-teal-100 text-km0-teal-700',
}

const STATUS_KEY: Record<InvitationStatus, TKey> = {
  started: 'invites.status.started',
  pending: 'invites.status.pending',
  granted: 'invites.status.granted',
}

const formatDate = (iso: string, lang: Lang): string => {
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  return new Date(iso)
    .toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    .replace(/\.$/, '')
}

/** Fecha pertinente de la fila: el hito más avanzado conocido. */
const relevantDate = (record: InvitationRecord): string | null =>
  record.grantedAt ?? record.completedAt ?? record.startedAt

interface SummaryTileProps {
  labelKey: TKey
  value: string
  Icon: LucideIcon
}

const MyInvitations = () => {
  const navigate = useNavigate()
  const scrollRef = useDragScroll('vertical')
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const { loading: authLoading } = useAuth()

  const { records, summary, loading, error, reload } = useInvitations()
  const requestedOrigin = searchParams.get('from')
  const origin: InvitationOrigin =
    requestedOrigin === 'home' ||
    requestedOrigin === 'actions' ||
    requestedOrigin === 'points'
      ? requestedOrigin
      : 'points'
  const originPath: Record<InvitationOrigin, string> = {
    home: '/home',
    points: '/points-history',
    actions: '/points-actions',
  }
  const originTab: Record<InvitationOrigin, HomeTab> = {
    home: 'home',
    points: 'puntos',
    actions: 'actions',
  }
  const [openId, setOpenId] = useState<string | null>(null)

  const progress = getFriendProgress(summary)
  const sorted = useMemo(() => {
    return [...records].sort((a, b) => {
      const da = relevantDate(a)
      const db = relevantDate(b)
      return new Date(db ?? 0).getTime() - new Date(da ?? 0).getTime()
    })
  }, [records])

  const goInvite = () => navigate('/invite')
  const goBack = () => {
    if (location.state !== null) {
      navigate(-1)
      return
    }
    navigate(originPath[origin])
  }

  const renderSummaryTile = ({ labelKey, value, Icon }: SummaryTileProps) => (
    <div
      key={labelKey}
      className="rounded-2xl bg-card px-3 py-3 border border-km0-blue-100"
    >
      <Icon aria-hidden size={16} className="text-km0-blue-700" />
      <p className="mt-1.5 font-brand text-xl font-black tabular-nums text-km0-blue-900">
        {value}
      </p>
      <p className="font-body text-[11px] leading-tight text-km0-blue-800/70">
        {t(labelKey, lang)}
      </p>
    </div>
  )

  const renderMilestone = (labelKey: TKey, date: string | null) => (
    <li className="flex items-center justify-between gap-2">
      <span className="font-body text-xs text-km0-blue-800/80">
        {t(labelKey, lang)}
      </span>
      {date ? (
        <span className="font-ui text-xs font-bold tabular-nums text-km0-blue-900">
          {formatDate(date, lang)}
        </span>
      ) : null}
    </li>
  )

  const renderRow = (record: InvitationRecord) => {
    const open = openId === record.id
    const date = relevantDate(record)
    const name = record.displayName ?? t('invites.row.person', lang)

    return (
      <li
        key={record.id}
        className="overflow-hidden rounded-2xl border border-km0-blue-100 bg-card"
      >
        <Button
          variant="bubbleSurface"
          type="button"
          onClick={() => setOpenId(open ? null : record.id)}
          aria-expanded={open}
          aria-label={t('invites.detail.open', lang)}
          className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors active:bg-km0-beige-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-km0-blue-50 text-km0-blue-700">
            <UserRound aria-hidden size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-ui text-sm font-bold text-km0-blue-900">
              {name}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-ui text-[10px] font-black',
                  STATUS_STYLE[record.status]
                )}
              >
                {t(STATUS_KEY[record.status], lang)}
              </span>
              {date ? (
                <span className="font-body text-[11px] tabular-nums text-km0-blue-800/60">
                  {formatDate(date, lang)}
                </span>
              ) : null}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={cn(
                'font-brand text-sm font-black tabular-nums',
                record.status === 'granted'
                  ? 'text-km0-teal-700'
                  : 'text-km0-blue-800/50'
              )}
            >
              +{record.points}
            </span>
            <ChevronRight
              aria-hidden
              size={16}
              className={cn(
                'text-km0-blue-700/60 transition-transform',
                open && 'rotate-90'
              )}
            />
          </span>
        </Button>

        {open ? (
          <div className="border-t border-km0-blue-100 bg-km0-beige-50/60 px-3 py-3">
            <ul className="flex flex-col gap-1.5">
              {record.startedAt
                ? renderMilestone('invites.milestone.started', record.startedAt)
                : null}
              {record.completedAt
                ? renderMilestone(
                    'invites.milestone.completed',
                    record.completedAt
                  )
                : null}
              {record.grantedAt
                ? renderMilestone('invites.milestone.granted', record.grantedAt)
                : null}
            </ul>

            {record.status === 'granted' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/points-history')}
                className="mt-3 h-9 w-full border-km0-blue-100 font-ui text-xs font-bold text-km0-blue-800"
              >
                <Coins aria-hidden />
                {t('invites.detail.see_points', lang)}
              </Button>
            ) : null}

            {record.status === 'pending' ? (
              <p className="mt-3 flex items-start gap-1.5 font-body text-[11px] leading-snug text-km0-blue-800/70">
                <Clock aria-hidden size={13} className="mt-0.5 shrink-0" />
                {t('invites.detail.pending_note', lang)}
              </p>
            ) : null}
          </div>
        ) : null}
      </li>
    )
  }

  const renderLoading = () => (
    <div className="flex min-h-full items-center justify-center">
      <Loader2
        className="animate-spin text-km0-blue-700"
        aria-label={t('common.loading', lang)}
      />
    </div>
  )

  const renderError = () => (
    <section className="flex min-h-full flex-col items-center justify-center text-center">
      <AlertCircle aria-hidden size={40} className="text-km0-coral-400" />
      <h2 className="mt-3 font-brand text-xl font-black text-km0-blue-900">
        {t('invites.error.title', lang)}
      </h2>
      <p className="mt-2 font-body text-sm text-km0-blue-800/70">
        {t('invites.error.description', lang)}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={reload}
        className="mt-4 border-km0-blue-100 font-ui font-bold text-km0-blue-800"
      >
        <RefreshCw aria-hidden />
        {t('invites.error.retry', lang)}
      </Button>
    </section>
  )

  const renderEmpty = () => (
    <section className="flex flex-col items-center py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-km0-yellow-100 text-km0-blue-900">
        <Share2 aria-hidden size={24} />
      </span>
      <h2 className="mt-3 font-brand text-base font-black text-km0-blue-900">
        {t('invites.empty.title', lang)}
      </h2>
      <p className="mt-2 font-body text-sm leading-snug text-km0-blue-800/70">
        {t('invites.empty.description', lang)}
      </p>
      <Button
        type="button"
        onClick={goInvite}
        className="mt-4 bg-km0-blue-600 font-ui font-bold text-km0-yellow-400 hover:bg-km0-blue-700"
      >
        <Share2 aria-hidden />
        {t('invites.cta', lang)}
      </Button>
    </section>
  )

  const renderContent = () => {
    if (error) return renderError()
    if (authLoading || loading) return renderLoading()
    if (records.length === 0) return renderEmpty()

    return (
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            'grid gap-2',
            progress.rewarding ? 'grid-cols-3' : 'grid-cols-2'
          )}
        >
          {progress.rewarding
            ? renderSummaryTile({
                labelKey: 'invites.summary.friends',
                value: tf('invites.summary.of_limit', lang, {
                  count: progress.count,
                  limit: progress.limit,
                }),
                Icon: UserRound,
              })
            : null}
          {renderSummaryTile({
            labelKey: 'invites.summary.points',
            value: String(summary.pointsEarned),
            Icon: Coins,
          })}
          {renderSummaryTile({
            labelKey: 'invites.summary.pending',
            value: String(summary.pointsPending),
            Icon: Hourglass,
          })}
        </div>

        <ul className="flex flex-col gap-2">{sorted.map(renderRow)}</ul>

        <p className="font-body text-[11px] leading-snug text-km0-blue-800/55">
          {t('invites.disclaimer', lang)}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full w-full justify-center overflow-hidden bg-km0-beige-50">
        <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-km0-beige-50">
          <ScreenHeader
            title={t('invites.title', lang)}
            onBack={goBack}
            backAriaLabel={t('common.back', lang)}
          />

          <main
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4"
          >
            <p className="mb-4 font-body text-sm text-km0-blue-800/65">
              {t('invites.subtitle', lang)}
            </p>
            <Button
              type="button"
              onClick={goInvite}
              className="mb-4 bg-km0-blue-600 font-ui text-xs font-bold text-km0-yellow-400 hover:bg-km0-blue-700"
            >
              {t('invites.cta', lang)}
            </Button>
            {renderContent()}
          </main>

          <BottomTabs
            activeTab={originTab[origin]}
            isAuthed
            onLogin={() => navigate('/login')}
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

export default MyInvitations
