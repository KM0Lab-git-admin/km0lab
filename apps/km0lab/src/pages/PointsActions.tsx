import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Cake,
  UserPlus,
  Star,
  QrCode,
  Globe,
  Mail,
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from 'lucide-react'

import DeviceShell from '@/components/DeviceShell'
import BottomTabs from '@/components/BottomTabs'
import { useAuth } from '@km0lab/app'
import { useLang } from '@/contexts/LangContext'
import { t, type Lang } from '@km0lab/app'
import { cn } from '@/lib/utils'
import { POINTS_ACTIONS } from '@/data/pointsActions'
import type { PointAction, PointActionIcon } from '@km0lab/app'

/* ─── Filtros ────────────────────────────────────────────── */
type Filter = 'all' | 'pending' | 'completed'

/* ─── Mapa icono ─────────────────────────────────────────── */
const ICONS: Record<PointActionIcon, LucideIcon> = {
  cake: Cake,
  'user-plus': UserPlus,
  star: Star,
  qr: QrCode,
  globe: Globe,
  mail: Mail,
  'calendar-check': CalendarCheck,
  'clipboard-list': ClipboardList,
}

const ICON_META: Record<PointActionIcon, { ring: string; text: string }> = {
  cake: { ring: 'bg-km0-coral-100', text: 'text-km0-coral-400' },
  'user-plus': { ring: 'bg-km0-teal-100', text: 'text-km0-teal-600' },
  star: { ring: 'bg-km0-yellow-100', text: 'text-km0-blue-800' },
  qr: { ring: 'bg-km0-blue-100', text: 'text-km0-blue-700' },
  globe: { ring: 'bg-km0-blue-100', text: 'text-km0-blue-700' },
  mail: { ring: 'bg-km0-yellow-100', text: 'text-km0-blue-800' },
  'calendar-check': { ring: 'bg-km0-teal-100', text: 'text-km0-teal-600' },
  'clipboard-list': { ring: 'bg-km0-yellow-100', text: 'text-km0-blue-800' },
}

const fmtInt = (n: number) => n.toLocaleString('es-ES')

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

/* ─── Fila de acción ─────────────────────────────────────── */
const ActionRow = ({
  action,
  lang,
  index,
}: {
  action: PointAction
  lang: Lang
  index: number
}) => {
  const Icon = ICONS[action.icon]
  const meta = ICON_META[action.icon]

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.25) }}
      className={cn(
        'flex items-center gap-3 px-3 py-3 bg-white rounded-2xl border border-km0-blue-100',
        action.completed && 'opacity-80'
      )}
    >
      <span
        className={cn(
          'shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center',
          meta.ring
        )}
      >
        <Icon size={20} className={meta.text} strokeWidth={2.2} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-ui font-bold text-sm text-km0-blue-900 leading-tight">
          {t(action.titleKey, lang)}
        </p>
        <p className="font-body text-xs text-km0-blue-800/60 mt-0.5 leading-snug">
          {t(action.descriptionKey, lang)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide',
              'bg-km0-blue-100 text-km0-blue-800'
            )}
          >
            {t(action.typeKey, lang)}
          </span>
          {action.completed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide bg-km0-teal-100 text-km0-teal-700 flex items-center gap-1">
              <CheckCircle2 size={10} strokeWidth={2.4} />
              {t('points.actions.completed', lang)}
            </span>
          )}
          {!action.completed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide bg-km0-beige-100 text-km0-blue-800 flex items-center gap-1">
              <Circle size={10} strokeWidth={2.4} />
              {t('points.actions.pending', lang)}
            </span>
          )}
        </div>
      </div>

      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-1.5 font-ui font-black text-xs tabular-nums',
          action.completed
            ? 'bg-km0-teal-100 text-km0-teal-700'
            : 'bg-km0-yellow-400/90 text-km0-blue-900'
        )}
      >
        +{fmtInt(action.points)} pts
      </span>
    </motion.li>
  )
}

/* ─── Pantalla ───────────────────────────────────────────── */
const PointsActions = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  const isAuthed =
    !!user ||
    (typeof window !== 'undefined' &&
      sessionStorage.getItem('km0_preview_authed') === '1')

  // Simulación de carga para respetar los 4 estados de UI.
  useMemo(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const { completedCount, pendingCount, totalPoints } = useMemo(() => {
    const completed = POINTS_ACTIONS.filter((a) => a.completed).length
    const pending = POINTS_ACTIONS.length - completed
    const points = POINTS_ACTIONS.filter((a) => !a.completed).reduce(
      (sum, a) => sum + a.points,
      0
    )
    return {
      completedCount: completed,
      pendingCount: pending,
      totalPoints: points,
    }
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'completed') return POINTS_ACTIONS.filter((a) => a.completed)
    if (filter === 'pending') return POINTS_ACTIONS.filter((a) => !a.completed)
    return POINTS_ACTIONS
  }, [filter])

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header */}
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
              {t('points.actions.title', lang)}
            </h1>
          </header>

          {/* Resumen */}
          <section className="shrink-0 px-4 pb-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-4 shadow-[0_12px_28px_-12px_hsl(var(--km0-blue-900)/0.45)]"
            >
              <Globe
                className="absolute -bottom-3 -right-3 w-24 h-24 text-white/5 rotate-12 pointer-events-none"
                strokeWidth={1}
              />
              <p className="relative z-10 font-body text-xs text-white/70 uppercase tracking-wide">
                {t('points.actions.subtitle', lang)}
              </p>
              <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/10 px-2 py-2 text-center">
                  <p className="font-brand font-black text-km0-teal-300 text-lg tabular-nums">
                    {completedCount}
                  </p>
                  <p className="font-body text-[10px] text-white/60 uppercase tracking-wide">
                    {t('points.actions.completed', lang)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-2 text-center">
                  <p className="font-brand font-black text-km0-yellow-400 text-lg tabular-nums">
                    {pendingCount}
                  </p>
                  <p className="font-body text-[10px] text-white/60 uppercase tracking-wide">
                    {t('points.actions.pending', lang)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-2 text-center">
                  <p className="font-brand font-black text-white text-lg tabular-nums">
                    +{fmtInt(totalPoints)}
                  </p>
                  <p className="font-body text-[10px] text-white/60 uppercase tracking-wide">
                    {t('common.points', lang)}
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
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              label={t('points.actions.pending', lang)}
            />
            <FilterChip
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
              label={t('points.actions.completed', lang)}
            />
          </div>

          {/* Lista */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('common.loading', lang)}
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <p className="font-body text-sm text-km0-blue-800/60">
                  {t('points.actions.empty', lang)}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3 pt-2">
                {filtered.map((action, i) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    lang={lang}
                    index={i}
                  />
                ))}
              </ul>
            )}
          </div>

          <BottomTabs
            activeTab="actions"
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

export default PointsActions
