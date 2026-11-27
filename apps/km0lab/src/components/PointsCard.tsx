import { t } from '@km0lab/app'
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'

import PointsCoin from '@/components/PointsCoin'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * PointsCard — tarjeta de progreso del usuario registrado.
 *
 * Diseño inspirado en el mockup proporcionado:
 *  ┌─────────────────────────────────────────────┐
 *  │  1.240 punts              NIVELL 4   ★      │
 *  │  ░░░░░░░░░░░░░░░░░░░░░░░░                   │
 *  │  🎁  A 260 punts de la propera recompensa…  │
 *  └─────────────────────────────────────────────┘
 *
 * Fondo azul marino, barra de progreso amarillo→teal,
 * tipografía de marca y estrella decorativa de fondo.
 */
export interface PointsCardProps {
  points: number
  nextLevel: number
  /** Nombre del siguiente regalo/recompensa (ej: "Val de 5€ al Forn Rovira"). */
  nextReward?: string
  /** Nivel actual (ej: 4). Si no se pasa, se usa "Local". */
  level?: number
  /** Si se pasa, la tarjeta es pulsable y navega al historial. */
  onClick?: () => void
}

const PointsCard = ({
  points,
  nextLevel,
  nextReward,
  level,
  onClick,
}: PointsCardProps) => {
  const { lang } = useLang()
  const safePoints = Math.max(0, points)
  const safeNext = Math.max(safePoints + 1, nextLevel)
  const pct = Math.min(100, Math.round((safePoints / safeNext) * 100))
  const pointsToNext = Math.max(0, safeNext - safePoints)

  const clickable = typeof onClick === 'function'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      {...(clickable
        ? {
            role: 'button',
            tabIndex: 0,
            onClick,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            },
          }
        : {})}
      className={cn(
        'relative w-full overflow-hidden rounded-3xl bg-card p-4 shadow-[var(--shadow-bubble)]',
        clickable &&
          'cursor-pointer hover:brightness-95 active:scale-[0.96] transition-[filter,transform] duration-150 motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-km0-yellow-400'
      )}
    >
      {/* Fila superior: puntos + nivel */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <PointsCoin points={safePoints} />
          <span className="font-body text-km0-blue-700/80 text-sm">
            {t('common.points', lang)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-km0-yellow-400/20 px-2.5 py-1">
          <span className="font-ui font-bold text-km0-blue-700 text-xs uppercase tracking-wide">
            {level
              ? t('home.points.level', lang).replace('{n}', String(level))
              : t('home.points.level', lang).replace('{n}', '1')}
          </span>
        </div>
      </div>

      {/* Barra de progreso + porcentaje */}
      <div className="relative z-10 mt-3 flex items-center gap-2">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={safeNext}
          aria-valuenow={safePoints}
          className="relative h-2.5 flex-1 rounded-full bg-km0-blue-100 overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="h-full rounded-full bg-km0-yellow-500"
          />
        </div>
        <span
          className="shrink-0 font-ui font-bold text-km0-blue-700 text-xs tabular-nums"
          aria-label={`${pct}%`}
        >
          {pct}%
        </span>
      </div>

      {/* Fila inferior: regalo + recompensa */}
      {nextReward && (
        <div className="relative z-10 mt-3 flex items-start gap-2.5">
          <span className="shrink-0 w-7 h-7 rounded-full bg-km0-yellow-100 flex items-center justify-center">
            <Gift className="w-3.5 h-3.5 text-km0-blue-700" />
          </span>
          <p className="font-body text-xs text-km0-blue-700/80 leading-snug">
            {t('home.points.toReward', lang)
              .replace('{n}', pointsToNext.toLocaleString('es-ES'))
              .replace('{reward}', nextReward)}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default PointsCard
