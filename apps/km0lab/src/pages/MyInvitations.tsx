import { useAuth } from '@km0lab/app'
import {
  t,
  type Lang,
  type TKey,
  fetchInvitations,
  summarizeInvitations,
  type InvitationsVariant,
  type InvitationRecord,
  type InvitationStatus,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Loader2,
  RefreshCw,
  Share2,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import BottomTabs, { type HomeTab } from '@/components/BottomTabs'
import DeviceShell from '@/components/DeviceShell'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─── Filtros ─────────────────────────────────────────────── */
type Filter = 'all' | 'person' | 'business'
type InvitationOrigin = 'home' | 'points' | 'actions'
const FILTERS: { key: Filter; labelKey: TKey }[] = [
  { key: 'all', labelKey: 'invites.filter.all' },
  { key: 'person', labelKey: 'invites.filter.persons' },
  { key: 'business', labelKey: 'invites.filter.businesses' },
]

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
  value: number
  Icon: LucideIcon
}

const MyInvitations = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const { loading: authLoading } = useAuth()

  const forcedState = searchParams.get('state')
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
  const variant: InvitationsVariant =
    forcedState === 'empty'
      ? 'empty'
      : forcedState === 'pending'
        ? 'pending'
        : 'default'

  const [records, setRecords] = useState<InvitationRecord[] | null>(null)
  const [failed, setFailed] = useState(forcedState === 'error')
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (forcedState === 'error' || forcedState === 'loading') return
    let active = true
    setRecords(null)
    fetchInvitations(variant)
      .then((data) => {
        if (active) setRecords(data)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [variant, forcedState, reloadToken])

  const summary = useMemo(() => summarizeInvitations(records ?? []), [records])

  const filtered = useMemo(() => {
    const list = records ?? []
    const scoped =
      filter === 'all' ? list : list.filter((r) => r.kind === filter)
    return [...scoped].sort((a, b) => {
      const da = relevantDate(a)
      const db = relevantDate(b)
      return new Date(db ?? 0).getTime() - new Date(da ?? 0).getTime()
    })
  }, [records, filter])

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
    const Icon = record.kind === 'person' ? UserRound : Building2
    const date = relevantDate(record)
    const name =
      record.displayName ??
      t(
        record.kind === 'person'
          ? 'invites.row.person'
          : 'invites.row.business',
        lang
      )

    return (
      <li
        key={record.id}
        className="overflow-hidden rounded-2xl border border-km0-blue-100 bg-card"
      >
        <button
          type="button"
          onClick={() => setOpenId(open ? null : record.id)}
          aria-expanded={open}
          aria-label={t('invites.detail.open', lang)}
          className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors active:bg-km0-beige-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-km0-blue-50 text-km0-blue-700">
            <Icon aria-hidden size={18} />
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
        </button>

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
        onClick={() => {
          setFailed(false)
          setReloadToken((token) => token + 1)
        }}
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

  const renderFilterEmpty = () => (
    <section className="rounded-2xl border border-dashed border-km0-blue-100 bg-card px-4 py-6 text-center">
      <h2 className="font-ui text-sm font-bold text-km0-blue-900">
        {t('invites.filter_empty.title', lang)}
      </h2>
      <p className="mt-1 font-body text-xs text-km0-blue-800/70">
        {t('invites.filter_empty.description', lang)}
      </p>
    </section>
  )

  const renderContent = () => {
    if (failed) return renderError()
    if (authLoading || forcedState === 'loading' || records === null)
      return renderLoading()
    if (records.length === 0) return renderEmpty()

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {renderSummaryTile({
            labelKey: 'invites.summary.persons',
            value: summary.personsRegistered,
            Icon: UserRound,
          })}
          {renderSummaryTile({
            labelKey: 'invites.summary.businesses',
            value: summary.businessesRegistered,
            Icon: Building2,
          })}
          {renderSummaryTile({
            labelKey: 'invites.summary.points',
            value: summary.pointsEarned,
            Icon: Coins,
          })}
        </div>

        <div
          role="tablist"
          aria-label={t('invites.title', lang)}
          className="grid grid-cols-3 gap-1.5 rounded-2xl border border-km0-blue-700/20 bg-km0-beige-100 p-1.5"
        >
          {FILTERS.map(({ key, labelKey }) => {
            const active = filter === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={cn(
                  'min-h-9 rounded-full px-2 py-1.5 font-ui text-[11px] font-bold transition-all active:scale-95',
                  active
                    ? 'bg-km0-blue-600 text-km0-yellow-400 shadow-sm'
                    : 'text-km0-blue-700 hover:bg-km0-beige-50'
                )}
              >
                {t(labelKey, lang)}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          renderFilterEmpty()
        ) : (
          <ul className="flex flex-col gap-2">{filtered.map(renderRow)}</ul>
        )}

        <p className="font-body text-[11px] leading-snug text-km0-blue-800/55">
          {t('invites.disclaimer', lang)}
        </p>
      </div>
    )
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
                onClick={goBack}
                aria-label={t('common.back', lang)}
                className="shrink-0 rounded-xl border-km0-blue-100"
              >
                <ChevronLeft aria-hidden />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-brand text-xl font-black text-km0-blue-900">
                  {t('invites.title', lang)}
                </h1>
                <p className="font-body text-xs text-km0-blue-800/65">
                  {t('invites.subtitle', lang)}
                </p>
              </div>
              <Button
                type="button"
                onClick={goInvite}
                className="shrink-0 bg-km0-blue-600 font-ui text-xs font-bold text-km0-yellow-400 hover:bg-km0-blue-700"
              >
                {t('invites.cta', lang)}
              </Button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
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
    </DeviceShell>
  )
}

export default MyInvitations
