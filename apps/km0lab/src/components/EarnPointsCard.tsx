import { t, type TKey } from '@km0lab/app'
import { motion } from 'framer-motion'
import { ShoppingBag, CalendarDays, Lock } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * EarnPointsCard — módulo guest que muestra las acciones disponibles para
 * ganar puntos y deja claro que están bloqueadas hasta registrarse.
 *
 * Diseño: lista de cards blancas con borde amarillo sutil, icono a la
 * izquierda, título + subtítulo, y candado a la derecha.
 */

export interface EarnAction {
  id: string
  icon: 'shopping' | 'event'
  titleKey: TKey
  subtitleKey: TKey
}

export interface EarnPointsCardProps {
  actions?: EarnAction[]
  className?: string
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
  },
  {
    id: 'event',
    icon: 'event',
    titleKey: 'home.earn.action.event.title',
    subtitleKey: 'home.earn.action.event.subtitle',
  },
]

const EarnPointsCard = ({
  actions = DEFAULT_ACTIONS,
  className,
}: EarnPointsCardProps) => {
  const { lang } = useLang()

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'w-full rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-4 py-4 vertical-tablet:px-5 vertical-tablet:py-5 horizontal-mobile:!px-3 horizontal-mobile:!py-3 space-y-3',
        className
      )}
    >
      <h2 className="font-brand font-black text-km0-blue-800 text-base vertical-tablet:text-lg horizontal-mobile:!text-sm">
        {t('home.earn.title', lang)}
        <span className="text-km0-teal-500"> {t('home.earn.today', lang)}</span>
      </h2>

      <div className="flex flex-col gap-2.5 vertical-tablet:gap-3 horizontal-mobile:!gap-2">
        {actions.map((action, i) => {
          const Icon = ICONS[action.icon]
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-center gap-3 vertical-tablet:gap-4 horizontal-mobile:!gap-2.5 rounded-2xl border border-km0-yellow-300/60 bg-white px-3 py-3 vertical-tablet:px-4 vertical-tablet:py-3.5 horizontal-mobile:!px-2.5 horizontal-mobile:!py-2 shadow-sm"
            >
              <span
                className={cn(
                  'shrink-0 w-10 h-10 vertical-tablet:w-12 vertical-tablet:h-12 horizontal-mobile:!w-8 horizontal-mobile:!h-8 rounded-2xl flex items-center justify-center',
                  ICON_BG[action.icon]
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 vertical-tablet:w-6 vertical-tablet:h-6 horizontal-mobile:!w-4 horizontal-mobile:!h-4',
                    ICON_COLOR[action.icon]
                  )}
                  strokeWidth={2.2}
                />
              </span>

              <div className="flex-1 min-w-0 flex flex-col leading-tight">
                <span className="font-brand font-black text-km0-blue-800 text-sm vertical-tablet:text-base horizontal-mobile:!text-xs">
                  {t(action.titleKey, lang)}
                </span>
                <span className="font-body text-km0-blue-700/70 text-xs vertical-tablet:text-sm horizontal-mobile:!text-[10px]">
                  {t(action.subtitleKey, lang)}
                </span>
              </div>

              <span className="shrink-0 text-km0-blue-700/40">
                <Lock
                  className="w-5 h-5 vertical-tablet:w-6 vertical-tablet:h-6 horizontal-mobile:!w-4 horizontal-mobile:!h-4"
                  strokeWidth={2}
                />
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

export default EarnPointsCard
