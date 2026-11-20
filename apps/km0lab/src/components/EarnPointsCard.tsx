import { t, useHomeActions } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion } from 'framer-motion'
import {
  Cake,
  UserPlus,
  Star,
  QrCode,
  Globe,
  Mail,
  Share2,
  CalendarCheck,
  ClipboardList,
  ArrowRight,
  Lock,
  type LucideIcon,
} from 'lucide-react'

import type { PointAction, PointActionIcon } from '@km0lab/app'

import PointsCoin from '@/components/PointsCoin'
import ScreenStatus from '@/components/ScreenStatus'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * EarnPointsCard — módulo home que muestra las 3 primeras acciones
 * pendientes con el mismo formato que la pantalla de acciones
 * (`/points-actions`).
 */

export interface EarnPointsCardProps {
  className?: string
  isAuthed?: boolean
  /** Enlace opcional "Veure totes" que navega a /points-actions. */
  onSeeAll?: () => void
  /** Si true, aplica overlay de candado + CTA de registro. */
  locked?: boolean
  /** Handler para el CTA de registro cuando `locked`. */
  onLogin?: () => void
}

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

const EarnPointsCard = ({
  className,
  onSeeAll,
  locked = false,
  onLogin,
  isAuthed = false,
}: EarnPointsCardProps) => {
  const { lang } = useLang()

  const { actions, loading, error, reload } = useHomeActions()
  const pending: PointAction[] = actions.filter((a) => !a.completed).slice(0, 3)
  const handleSeeAll = locked ? onLogin : onSeeAll

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('w-full space-y-3', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-brand font-black text-km0-blue-800 text-lg flex items-center gap-2">
          <span>
            {t('home.earn.title', lang)}
            <span className="text-km0-teal-700">
              {' '}
              {t('home.earn.today', lang)}
            </span>
          </span>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-km0-blue-800/85 text-primary-foreground px-2 py-0.5 text-[11px] font-ui font-bold uppercase tracking-wide">
              <Lock size={10} strokeWidth={2.4} />
              {t('home.locked.badge', lang)}
            </span>
          )}
        </h2>
        {handleSeeAll && (
          <Button
            variant="bubbleLink"
            type="button"
            onClick={handleSeeAll}
            className="shrink-0 gap-1 px-0 text-xs text-km0-coral-700"
          >
            {t('home.action.see_all_m', lang)}
            <ArrowRight size={13} strokeWidth={2.4} />
          </Button>
        )}
      </div>

      {loading || error || pending.length === 0 ? (
        <ScreenStatus
          state={loading ? 'loading' : error ? 'error' : 'empty'}
          emptyKey="points.actions.empty"
          onRetry={reload}
        />
      ) : (
        <ul
          className={cn(
            'flex flex-col gap-3',
            locked && 'pointer-events-none opacity-60'
          )}
          aria-hidden={locked || undefined}
        >
          {pending.map((action, i) => {
            const Icon = ICONS[action.icon]
            const meta = ICON_META[action.icon]
            return (
              <motion.li
                key={action.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.06, 0.25) }}
                className="flex items-center gap-3 px-3 py-3 bg-card rounded-[20px] shadow-[var(--shadow-bubble)]"
              >
                <span
                  className={cn(
                    'shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
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
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-ui font-bold uppercase tracking-wide bg-km0-blue-100 text-km0-blue-800">
                      {t(action.typeKey, lang)}
                    </span>
                    {isAuthed && (
                      <span className="rounded-full bg-km0-blue-100 px-2 py-0.5 font-ui text-[11px] font-bold text-km0-blue-800">
                        {t('points.actions.pending', lang)}
                      </span>
                    )}
                  </div>
                </div>

                <PointsCoin
                  points={action.earnedPoints ?? action.points}
                  earned
                />
              </motion.li>
            )
          })}
        </ul>
      )}
    </motion.section>
  )
}

export default EarnPointsCard
