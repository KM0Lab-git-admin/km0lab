import {
  usePointsActions,
  usePreviewState,
  useDragScroll,
  useAuth,
  t,
  type Lang,
  useInviteRewards,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion } from 'framer-motion'
import {
  Cake,
  UserPlus,
  Star,
  QrCode,
  Globe,
  Mail,
  CalendarCheck,
  ClipboardList,
  Share2,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PointAction, PointActionIcon } from '@km0lab/app'

import BottomTabs from '@/components/AccountBottomTabs'
import FilterChip from '@/components/FilterChip'
import ScreenHeader from '@/components/ScreenHeader'
import ScreenStatus from '@/components/ScreenStatus'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

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
  share: Share2,
  'calendar-check': CalendarCheck,
  'clipboard-list': ClipboardList,
}

const ICON_META: Record<PointActionIcon, { ring: string; text: string }> = {
  share: { ring: 'bg-km0-coral-100', text: 'text-km0-coral-400' },
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
        'flex items-center gap-3 px-3 py-3 bg-card rounded-2xl border border-km0-blue-100',
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
          {action.title ?? t(action.titleKey, lang)}
        </p>
        <p className="font-body text-xs text-km0-blue-800/60 mt-0.5 leading-snug">
          {action.description ?? t(action.descriptionKey, lang)}
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
        +{fmtInt(action.earnedPoints ?? action.points)} pts
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
  const {
    actions: availableActions,
    loading,
    error,
    reload,
  } = usePointsActions()
  const inviteRewards = useInviteRewards()
  const actions = useMemo(
    () =>
      availableActions.map((action) => ({
        ...action,
        completed: !!user && action.completed,
      })),
    [availableActions, user]
  )
  const scrollRef = useDragScroll('vertical')

  const isAuthed =
    !!user ||
    (typeof window !== 'undefined' &&
      sessionStorage.getItem('km0_preview_authed') === '1')

  const { completedCount, pendingCount, totalPoints } = useMemo(() => {
    const completed = actions.filter((a) => a.completed).length
    const pending = actions.length - completed
    const points = actions
      .filter((a) => !a.completed)
      .reduce((sum, a) => sum + (a.earnedPoints ?? a.points), 0)
    return {
      completedCount: completed,
      pendingCount: pending,
      totalPoints: points,
    }
  }, [actions])

  const filtered = useMemo(() => {
    if (filter === 'completed') return actions.filter((a) => a.completed)
    if (filter === 'pending') return actions.filter((a) => !a.completed)
    return actions
  }, [actions, filter])

  const preview = usePreviewState(loading, !!error, filtered.length === 0)

  return (
    <>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          {/* Header */}
          <ScreenHeader title={t('points.actions.title', lang)} />
          {/* Lista */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6"
          >
            {/* Resumen */}
            <section className="shrink-0 pt-4 pb-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-4 shadow-[var(--shadow-bubble)]"
              >
                <Globe
                  className="absolute -bottom-3 -right-3 w-24 h-24 text-primary-foreground/5 rotate-12 pointer-events-none"
                  strokeWidth={1}
                />
                <p className="relative z-10 font-body text-xs text-primary-foreground/70 uppercase tracking-wide">
                  {t('points.actions.subtitle', lang)}
                </p>
                <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-card/10 px-2 py-2 text-center">
                    <p className="font-brand font-black text-km0-teal-300 text-lg tabular-nums">
                      {completedCount}
                    </p>
                    <p className="font-body text-[10px] text-primary-foreground/60 uppercase tracking-wide">
                      {t('points.actions.completed', lang)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-card/10 px-2 py-2 text-center">
                    <p className="font-brand font-black text-km0-yellow-400 text-lg tabular-nums">
                      {pendingCount}
                    </p>
                    <p className="font-body text-[10px] text-primary-foreground/60 uppercase tracking-wide">
                      {t('points.actions.pending', lang)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-card/10 px-2 py-2 text-center">
                    <p className="font-brand font-black text-primary-foreground text-lg tabular-nums">
                      +{fmtInt(totalPoints)}
                    </p>
                    <p className="font-body text-[10px] text-primary-foreground/60 uppercase tracking-wide">
                      {t('common.points', lang)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Filtros */}
            <div className="shrink-0 pb-2 flex items-center gap-2">
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

            {preview.state !== 'ready' ? (
              <ScreenStatus
                state={preview.state}
                emptyKey="points.actions.empty"
                onRetry={() => preview.retry(reload)}
              />
            ) : (
              <ul className="flex flex-col gap-3 pt-2">
                {filter !== 'completed' && (
                  <li>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/invite')}
                      className="h-auto w-full justify-start gap-3 rounded-2xl border-km0-blue-100 bg-card px-3 py-3 text-left"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-km0-coral-100 text-km0-coral-400">
                        <Share2 size={20} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 whitespace-normal">
                        <span className="block font-ui text-sm font-bold text-km0-blue-900">
                          {t('invite.title', lang)}
                        </span>
                        <span className="mt-0.5 block font-body text-xs font-normal leading-snug text-km0-blue-800/60">
                          {t('invite.action.description', lang)}
                        </span>
                        <span className="mt-1.5 inline-flex rounded-full bg-km0-blue-100 px-2 py-0.5 font-ui text-[10px] font-bold uppercase text-km0-blue-800">
                          {t('invite.action.type', lang)}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-normal rounded-full bg-km0-yellow-400/90 px-2 py-1 text-center font-ui text-[10px] font-black text-km0-blue-900">
                        +{inviteRewards.person}
                        <br />+{inviteRewards.business}
                      </span>
                    </Button>
                  </li>
                )}
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
    </>
  )
}

export default PointsActions
