import { t, useHomeActions, type Lang, type PointAction } from '@km0lab/app'
import { motion } from 'framer-motion'
import { ArrowRight, Circle, Lock, RefreshCw } from 'lucide-react'

import ActionTypeMark from '@/components/ActionTypeMark'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * EarnPointsCard — módulo home que muestra las 3 primeras acciones
 * pendientes con el mismo formato que la pantalla de acciones
 * (`/points-actions`).
 */

export interface EarnPointsCardProps {
  className?: string
  /** Enlace opcional "Veure totes" que navega a /points-actions. */
  onSeeAll?: () => void
  /** Si true, aplica overlay de candado + CTA de registro. */
  locked?: boolean
  /** Handler para el CTA de registro cuando `locked`. */
  onLogin?: () => void
}

const fmtInt = (n: number) => n.toLocaleString('es-ES')

const actionCopy = (action: PointAction, lang: Lang) => ({
  title: action.title || t(action.titleKey, lang),
  description: action.description || t(action.descriptionKey, lang),
})

const EarnPointsCard = ({
  className,
  onSeeAll,
  locked = false,
  onLogin,
}: EarnPointsCardProps) => {
  const { lang } = useLang()
  const { actions, loading, error, reload } = useHomeActions()

  const pending = actions.filter((a) => !a.completed).slice(0, 3)
  const handleSeeAll = locked ? onLogin : onSeeAll

  if (!loading && !error && pending.length === 0) return null

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
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-brand font-black text-km0-blue-800 text-base flex items-center gap-2">
          <span>
            {t('home.earn.title', lang)}
            <span className="text-km0-teal-500">
              {' '}
              {t('home.earn.today', lang)}
            </span>
          </span>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-km0-blue-800/85 text-white px-2 py-0.5 text-[10px] font-ui font-bold uppercase tracking-wide">
              <Lock size={10} strokeWidth={2.4} />
              {t('home.locked.badge', lang)}
            </span>
          )}
        </h2>
        {handleSeeAll && !loading && !error && (
          <button
            type="button"
            onClick={handleSeeAll}
            className="font-ui font-bold text-km0-coral-400 active:scale-95 transition-transform underline underline-offset-4 text-xs gap-0 flex items-center justify-start whitespace-nowrap shrink-0"
          >
            {t('home.action.see_all_m', lang)}
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {loading ? (
        <p className="font-body text-sm text-km0-blue-800/60 py-4 text-center">
          {t('common.loading', lang)}
        </p>
      ) : error ? (
        <div className="py-3 text-center space-y-3">
          <p className="font-brand text-sm text-km0-blue-900">
            {t('merchants.error.title', lang)}
          </p>
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-coral-500 text-white font-ui text-xs font-bold active:scale-95 transition-transform"
          >
            <RefreshCw size={12} />
            {t('merchants.error.retry', lang)}
          </button>
        </div>
      ) : (
        <ul
          className={cn(
            'flex flex-col gap-3',
            locked && 'pointer-events-none opacity-60'
          )}
          aria-hidden={locked || undefined}
        >
          {pending.map((action, i) => {
            const copy = actionCopy(action, lang)
            return (
              <motion.li
                key={action.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(i * 0.06, 0.25),
                }}
                className="flex items-center gap-3 px-3 py-3 bg-white rounded-2xl border border-km0-blue-100"
              >
                <ActionTypeMark icon={action.icon} />

                <div className="flex-1 min-w-0">
                  <p className="font-ui font-bold text-sm text-km0-blue-900 leading-tight">
                    {copy.title}
                  </p>
                  <p className="font-body text-xs text-km0-blue-800/60 mt-0.5 leading-snug">
                    {copy.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide bg-km0-blue-100 text-km0-blue-800">
                      {t(action.typeKey, lang)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wide bg-km0-beige-100 text-km0-blue-800 flex items-center gap-1">
                      <Circle size={10} strokeWidth={2.4} />
                      {t('points.actions.pending', lang)}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 rounded-full px-2.5 py-1.5 font-ui font-black text-xs tabular-nums bg-km0-yellow-400/90 text-km0-blue-900">
                  +{fmtInt(action.points)} pts
                </span>
              </motion.li>
            )
          })}
        </ul>
      )}
    </motion.section>
  )
}

export default EarnPointsCard
