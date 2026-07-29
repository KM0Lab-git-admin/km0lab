import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
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
  type LucideIcon,
} from 'lucide-react'

import DeviceShell from '@/components/DeviceShell'
import BottomTabs from '@/components/BottomTabs'
import { useAuth } from '@km0lab/app'
import { useLang } from '@/contexts/LangContext'
import { t, type Lang } from '@km0lab/app'
import { cn } from '@/lib/utils'
import { POINTS_HISTORY } from '@/data/pointsHistory'
import type { PointsTransaction, PointsTxType } from '@km0lab/app'

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

const fmtInt = (n: number) => Math.abs(n).toLocaleString('es-ES')

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
        {fmtInt(tx.points)}
      </span>
    </motion.li>
  )
}

/* ─── Chip filtro ────────────────────────────────────────── */
const FilterChip = ({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-3 py-1.5 rounded-full text-xs font-ui font-bold transition-colors',
      active
        ? 'bg-km0-blue-800 text-white'
        : 'bg-white text-km0-blue-800 border border-km0-blue-100'
    )}
  >
    {label}
  </button>
)

/* ─── Pantalla ───────────────────────────────────────────── */
const HistorialPunts = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const [filter, setFilter] = useState<Filter>('all')

  const isAuthed =
    !!user ||
    (typeof window !== 'undefined' &&
      sessionStorage.getItem('km0_preview_authed') === '1')

  const sorted = useMemo(
    () =>
      [...POINTS_HISTORY].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    []
  )

  const { balance, earned, spent } = useMemo(() => {
    let e = 0
    let s = 0
    for (const tx of sorted) {
      if (tx.points >= 0) e += tx.points
      else s += -tx.points
    }
    return { balance: e - s, earned: e, spent: s }
  }, [sorted])

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
      items: map.get(g)!,
    }))
  }, [filtered])

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header fijo */}
          <header className="shrink-0 flex items-center gap-2 px-3 pt-4 pb-3 bg-km0-beige-50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={t('common.back', lang)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-km0-blue-100 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} className="text-km0-blue-800" />
            </button>
            <h1 className="flex-1 text-center font-brand font-black text-base text-km0-blue-900 pr-10">
              {t('points.history.title', lang)}
            </h1>
          </header>

          {/* Resumen de saldo */}
          <section className="shrink-0 px-4 pb-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-4 shadow-[0_12px_28px_-12px_hsl(var(--km0-blue-900)/0.45)]"
            >
              <Coins
                className="absolute -bottom-3 -right-3 w-24 h-24 text-white/5 rotate-12 pointer-events-none"
                strokeWidth={1}
              />
              <p className="relative z-10 font-body text-xs text-white/70 uppercase tracking-wide">
                {t('points.history.balance', lang)}
              </p>
              <div className="relative z-10 mt-0.5 flex items-baseline gap-1.5">
                <span className="font-brand font-black text-white text-3xl tabular-nums">
                  {fmtInt(balance)}
                </span>
                <span className="font-body text-white/70 text-sm">
                  {t('common.points', lang)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/redeemed-rewards')}
                className="relative z-10 mt-3 flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 active:scale-[0.98] transition-transform w-fit"
              >
                <GiftIcon size={14} className="text-km0-yellow-100" />
                <span className="font-ui font-bold text-xs text-white">
                  {t('redemptions.see_list', lang)}
                </span>
              </button>

              <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="font-body text-[10px] text-white/60 uppercase tracking-wide">
                    {t('points.history.earned', lang)}
                  </p>
                  <p className="font-brand font-black text-km0-teal-300 text-lg tabular-nums">
                    +{fmtInt(earned)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="font-body text-[10px] text-white/60 uppercase tracking-wide">
                    {t('points.history.spent', lang)}
                  </p>
                  <p className="font-brand font-black text-km0-coral-300 text-lg tabular-nums">
                    −{fmtInt(spent)}
                  </p>
                </div>
              </div>
            </motion.div>
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

          {/* Lista */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6">
            {groups.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('points.history.empty', lang)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-2">
                {groups.map(({ group, items }, gi) => (
                  <section key={group}>
                    <h2 className="font-ui font-bold text-[11px] uppercase tracking-wide text-km0-blue-800/60 mb-1">
                      {t(GROUP_KEY[group], lang)}
                    </h2>
                    <ul className="bg-white rounded-2xl border border-km0-blue-100 divide-y divide-km0-beige-200 px-3">
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
    </DeviceShell>
  )
}

export default HistorialPunts
