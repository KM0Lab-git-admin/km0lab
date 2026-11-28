import {
  useDragScroll,
  useAccount,
  usePreviewState,
  useAuth,
  t,
  type Lang,
  useInviteSummary,
} from '@km0lab/app'
import type { PointsTransaction, PointsTxType } from '@km0lab/app'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomTabs from '@/components/AccountBottomTabs'
import FilterChip from '@/components/FilterChip'
import ScreenHeader from '@/components/ScreenHeader'
import ScreenStatus from '@/components/ScreenStatus'

import {
  UserPlus,
  Star,
  QrCode,
  Globe,
  CalendarCheck,
  ClipboardList,
  MessageSquarePlus,
  Tag,
  Coins,
  Gift as GiftIcon,
  ChevronRight,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@km0lab/ui'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─── Filtros ────────────────────────────────────────────── */
type Filter = 'all' | 'earned' | 'spent'

/* ─── Mapa tipo → icono + color ──────────────────────────── */
const TYPE_META: Record<
  PointsTxType,
  { Icon: LucideIcon; ring: string; text: string }
> = {
  signup: {
    Icon: UserPlus,
    ring: 'bg-km0-teal-100',
    text: 'text-km0-teal-700',
  },
  first_scan: {
    Icon: Star,
    ring: 'bg-km0-yellow-100',
    text: 'text-km0-blue-800',
  },
  scan: { Icon: QrCode, ring: 'bg-km0-blue-100', text: 'text-km0-blue-700' },
  web_visit: {
    Icon: Globe,
    ring: 'bg-km0-blue-100',
    text: 'text-km0-blue-700',
  },
  event_signup: {
    Icon: CalendarCheck,
    ring: 'bg-km0-teal-100',
    text: 'text-km0-teal-700',
  },
  survey: {
    Icon: ClipboardList,
    ring: 'bg-km0-yellow-100',
    text: 'text-km0-blue-800',
  },
  suggestion: {
    Icon: MessageSquarePlus,
    ring: 'bg-km0-teal-100',
    text: 'text-km0-teal-700',
  },
  invitation: {
    Icon: Share2,
    ring: 'bg-km0-teal-100',
    text: 'text-km0-teal-700',
  },
  invite_person: {
    Icon: Share2,
    ring: 'bg-km0-teal-100',
    text: 'text-km0-teal-700',
  },
  invite_business: {
    Icon: Share2,
    ring: 'bg-km0-teal-100',
    text: 'text-km0-teal-700',
  },
  demo_credit: {
    Icon: Coins,
    ring: 'bg-km0-yellow-100',
    text: 'text-km0-blue-800',
  },
  redeem: { Icon: Tag, ring: 'bg-km0-coral-100', text: 'text-km0-coral-500' },
}

/* ─── Agrupación por rango ───────────────────────────────── */
type Group = 'today' | 'week' | 'month' | 'earlier'
const GROUP_ORDER: Group[] = ['today', 'week', 'month', 'earlier']
const GROUP_KEY: Record<Group, Parameters<typeof t>[0]> = {
  today: 'points.history.group.today',
  week: 'points.history.group.week',
  month: 'points.history.group.month',
  earlier: 'points.history.group.earlier',
}

const startOfDay = (d: Date) => {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

const groupOf = (iso: string, now = new Date()): Group => {
  const d = new Date(iso)
  const today = startOfDay(now)
  const day = startOfDay(d)
  const diffDays = Math.floor((today.getTime() - day.getTime()) / 86_400_000)
  if (diffDays <= 0) return 'today'
  if (diffDays <= 7) return 'week'
  if (diffDays <= 30) return 'month'
  return 'earlier'
}

const formatDate = (iso: string, lang: Lang): string => {
  const d = new Date(iso)
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  return d
    .toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    .replace(/\.$/, '')
}

const fmtInt = (n: number) => n.toLocaleString('es-ES')

/* ─── Fila de movimiento ─────────────────────────────────── */
const TxRow = ({
  tx,
  lang,
  index,
}: {
  tx: PointsTransaction
  lang: Lang
  index: number
}) => {
  const meta = TYPE_META[tx.type]
  const positive = tx.points >= 0
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.25) }}
      className="flex items-center gap-3 py-3"
    >
      <span
        className={cn(
          'shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          meta.ring
        )}
      >
        <meta.Icon size={18} className={meta.text} strokeWidth={2.2} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-ui font-bold text-sm text-km0-blue-900 truncate">
          {t(tx.conceptKey, lang)}
        </p>
        <p className="font-body text-xs text-km0-blue-800/60 truncate">
          {[tx.place, formatDate(tx.date, lang)].filter(Boolean).join(' · ')}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 font-brand font-black text-base tabular-nums',
          positive ? 'text-km0-teal-600' : 'text-km0-coral-400'
        )}
      >
        {positive ? '+' : '−'}
        {fmtInt(Math.abs(tx.points))}
      </span>
    </motion.li>
  )
}

/* ─── Pantalla ───────────────────────────────────────────── */
const HistorialPunts = () => {
  const navigate = useNavigate()
  const account = useAccount()
  const { summary: invitationSummary } = useInviteSummary()
  const { lang } = useLang()
  const { user } = useAuth()
  const [filter, setFilter] = useState<Filter>('all')

  const isAuthed =
    !!user ||
    (typeof window !== 'undefined' &&
      sessionStorage.getItem('km0_preview_authed') === '1')

  const sorted = useMemo(
    () =>
      [...account.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [account.transactions]
  )

  const { balance, earned, spent } = account
  const scrollRef = useDragScroll('vertical')

  const filtered = useMemo(() => {
    if (filter === 'earned') return sorted.filter((tx) => tx.points >= 0)
    if (filter === 'spent') return sorted.filter((tx) => tx.points < 0)
    return sorted
  }, [sorted, filter])

  const groups = useMemo(() => {
    const map = new Map<Group, PointsTransaction[]>()
    for (const tx of filtered) {
      const g = groupOf(tx.date)
      const arr = map.get(g) ?? []
      arr.push(tx)
      map.set(g, arr)
    }
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      group: g,
      items: map.get(g) ?? [],
    }))
  }, [filtered])

  const preview = usePreviewState(
    account.loading,
    !!account.error,
    groups.length === 0
  )

  return (
    <>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header fijo */}
          <ScreenHeader
            title={t('points.history.title', lang)}
            onBack={() => {
              if (window.history.state?.idx > 0) navigate(-1)
              else navigate('/home')
            }}
            backAriaLabel={t('common.back', lang)}
          />
          {/* Lista */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6"
          >
            {/* Resumen de saldo */}
            <section className="shrink-0 px-4 pb-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-4 shadow-[var(--shadow-bubble)]"
              >
                <Coins
                  className="absolute -bottom-3 -right-3 w-24 h-24 text-primary-foreground/5 rotate-12 pointer-events-none"
                  strokeWidth={1}
                />
                <p className="relative z-10 font-body text-xs text-primary-foreground/70 uppercase tracking-wide">
                  {t('points.history.balance', lang)}
                </p>
                <div className="relative z-10 mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-brand font-black text-primary-foreground text-3xl tabular-nums">
                    {fmtInt(balance)}
                  </span>
                  <span className="font-body text-primary-foreground/70 text-sm">
                    {t('common.points', lang)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/redeemed-rewards')}
                  className="relative z-10 mt-3 flex items-center gap-2 rounded-full bg-card/15 px-3 py-2 active:scale-[0.98] transition-transform w-fit"
                >
                  <GiftIcon size={14} className="text-km0-yellow-100" />
                  <span className="font-ui font-bold text-xs text-primary-foreground">
                    {t('redemptions.see_list', lang)}
                  </span>
                </button>

                <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-card/10 px-3 py-2">
                    <p className="font-body text-[10px] text-primary-foreground/60 uppercase tracking-wide">
                      {t('points.history.earned', lang)}
                    </p>
                    <p className="font-brand font-black text-km0-teal-300 text-lg tabular-nums">
                      +{fmtInt(earned)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-card/10 px-3 py-2">
                    <p className="font-body text-[10px] text-primary-foreground/60 uppercase tracking-wide">
                      {t('points.history.spent', lang)}
                    </p>
                    <p className="font-brand font-black text-km0-coral-300 text-lg tabular-nums">
                      −{fmtInt(spent)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            <section className="shrink-0 px-4 pb-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate('/my-invitations?from=points', {
                    state: { invitationOrigin: 'points' },
                  })
                }
                className="h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl border-km0-blue-100 bg-card px-3 py-3 text-left"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-km0-yellow-100 text-km0-blue-900">
                  <Share2 aria-hidden size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-ui text-sm font-bold text-km0-blue-900">
                    {t('invites.points.title', lang)}
                  </span>
                  <span className="block font-body text-xs leading-snug text-km0-blue-800/65">
                    {invitationSummary.pointsEarned > 0
                      ? t('invites.points.earned', lang).replace(
                          '{points}',
                          fmtInt(invitationSummary.pointsEarned)
                        )
                      : t('invites.points.empty', lang)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-ui text-[11px] font-bold text-km0-blue-700">
                  {t('invites.points.action', lang)}
                  <ChevronRight aria-hidden size={15} />
                </span>
              </Button>
            </section>

            {/* Filtros */}
            <div className="shrink-0 px-4 pb-2 flex items-center gap-2">
              <FilterChip
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label={t('points.history.filter_all', lang)}
              />
              <FilterChip
                active={filter === 'earned'}
                onClick={() => setFilter('earned')}
                label={t('points.history.filter_earned', lang)}
              />
              <FilterChip
                active={filter === 'spent'}
                onClick={() => setFilter('spent')}
                label={t('points.history.filter_spent', lang)}
              />
            </div>

            <p className="mb-3 font-body text-[11px] text-muted-foreground">
              {t('account.demo', lang)}
            </p>
            {preview.state !== 'ready' ? (
              <ScreenStatus
                state={preview.state}
                emptyKey="points.history.empty"
                onRetry={() => preview.retry(account.reload)}
              />
            ) : (
              <div className="flex flex-col gap-4 pt-2">
                {groups.map(({ group, items }, gi) => (
                  <section key={group}>
                    <h2 className="font-ui font-bold text-[11px] uppercase tracking-wide text-km0-blue-800/60 mb-1">
                      {t(GROUP_KEY[group], lang)}
                    </h2>
                    <ul className="bg-card rounded-2xl border border-km0-blue-100 divide-y divide-km0-beige-200 px-3">
                      {items.map((tx, i) => (
                        <TxRow
                          key={tx.id}
                          tx={tx}
                          lang={lang}
                          index={gi * 3 + i}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>

          <BottomTabs
            activeTab="puntos"
            isAuthed={isAuthed}
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

export default HistorialPunts
