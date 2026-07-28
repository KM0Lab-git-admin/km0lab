import { t, type TKey } from '@km0lab/app'
import { motion } from 'framer-motion'
import { ShoppingBag, CalendarDays, Lock } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * EarnPointsCard — módulo que muestra las acciones disponibles para
 * ganar puntos.
 *
 * - Guest (`locked=true`): candado a la derecha y subtítulo "Registra't
 *   per desbloquejar".
 * - Registered (`locked=false`): badge con los puntos que otorga cada
 *   acción (mock) en lugar del candado.
 */

export interface EarnAction {
  id: string
  icon: 'shopping' | 'event'
  titleKey: TKey
  subtitleKey: TKey
  rewardKey: TKey
  points: number
}

export interface EarnPointsCardProps {
  actions?: EarnAction[]
  className?: string
  /** true = estado guest con candado; false = registered con puntos. */
  locked?: boolean
}

const ICONS = {
  shopping: ShoppingBag,
  event: CalendarDays,
} as const

const ICON_BG: Record<EarnAction['icon'], string> = {
  shopping: 'bg-km0-blue-100',
  event: 'bg-km0-coral-100',
}

const ICON_COLOR: Record<EarnAction['icon'], string> = {
  shopping: 'text-km0-blue-600',
  event: 'text-km0-coral-400',
}

const DEFAULT_ACTIONS: EarnAction[] = [
  {
    id: 'shop',
    icon: 'shopping',
    titleKey: 'home.earn.action.shop.title',
    subtitleKey: 'home.earn.action.shop.subtitle',
    rewardKey: 'home.earn.action.shop.reward',
    points: 10,
  },
  {
    id: 'event',
    icon: 'event',
    titleKey: 'home.earn.action.event.title',
    subtitleKey: 'home.earn.action.event.subtitle',
    rewardKey: 'home.earn.action.event.reward',
    points: 25,
  },
]

const EarnPointsCard = ({
  actions = DEFAULT_ACTIONS,
  className,
  locked = true,
}: EarnPointsCardProps) => {
  const { lang } = useLang()

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'w-full rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-4 py-4 space-y-3',
        className
      )}
    >
      <h2 className="font-brand font-black text-km0-blue-800 text-base">
        {t('home.earn.title', lang)}
        <span className="text-km0-teal-500"> {t('home.earn.today', lang)}</span>
      </h2>

      <div className="flex flex-col gap-2.5">
        {actions.map((action, i) => {
          const Icon = ICONS[action.icon]
          const subtitle = locked
            ? t(action.subtitleKey, lang)
            : t(action.rewardKey, lang).replace('{n}', String(action.points))
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-2xl border border-km0-yellow-300/60 bg-white px-3 py-3 shadow-sm"
            >
              <span
                className={cn(
                  'shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center',
                  ICON_BG[action.icon]
                )}
              >
                <Icon
                  className={cn('w-5 h-5', ICON_COLOR[action.icon])}
                  strokeWidth={2.2}
                />
              </span>

              <div className="flex-1 min-w-0 flex flex-col leading-tight">
                <span className="font-brand font-black text-km0-blue-800 text-sm">
                  {t(action.titleKey, lang)}
                </span>
                <span className="font-body text-km0-blue-700/70 text-xs">
                  {subtitle}
                </span>
              </div>

              {locked ? (
                <span className="shrink-0 text-km0-blue-700/40">
                  <Lock className="w-5 h-5" strokeWidth={2} />
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-km0-yellow-400/90 px-2.5 py-1">
                  <span className="font-ui font-bold text-km0-blue-900 text-xs tabular-nums">
                    +{action.points}
                  </span>
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

export default EarnPointsCard
