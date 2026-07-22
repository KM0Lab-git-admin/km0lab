import { t } from '@km0lab/app'
import { motion } from 'framer-motion'
import { Star, Gift } from 'lucide-react'

import { useLang } from '@/contexts/LangContext'

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
}

const PointsCard = ({
  points,
  nextLevel,
  nextReward,
  level,
}: PointsCardProps) => {
  const { lang } = useLang()
  const safePoints = Math.max(0, points)
  const safeNext = Math.max(safePoints + 1, nextLevel)
  const pct = Math.min(100, Math.round((safePoints / safeNext) * 100))
  const pointsToNext = Math.max(0, safeNext - safePoints)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative w-full max-w-[600px] overflow-hidden rounded-2xl vertical-tablet:rounded-3xl bg-gradient-to-br from-km0-blue-800 to-km0-blue-900 px-4 py-3.5 vertical-tablet:px-5 vertical-tablet:py-5 horizontal-mobile:!px-3 horizontal-mobile:!py-2 shadow-[0_12px_28px_-12px_hsl(var(--km0-blue-900)/0.45)]"
    >
      {/* Estrella decorativa de fondo */}
      <Star
        className="absolute -bottom-3 -right-3 w-24 h-24 vertical-tablet:w-32 vertical-tablet:h-32 horizontal-mobile:!w-16 horizontal-mobile:!h-16 text-white/5 rotate-12 pointer-events-none"
        strokeWidth={1}
        fill="currentColor"
      />

      {/* Fila superior: puntos + nivel */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-brand font-black text-white text-2xl vertical-tablet:text-3xl horizontal-mobile:!text-xl">
            {safePoints.toLocaleString('es-ES')}
          </span>
          <span className="font-body text-white/70 text-sm vertical-tablet:text-base horizontal-mobile:!text-xs">
            {t('common.points', lang)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-km0-yellow-400/20 px-2.5 py-1 vertical-tablet:px-3 vertical-tablet:py-1.5 horizontal-mobile:!px-2 horizontal-mobile:!py-0.5">
          <span className="font-ui font-bold text-km0-yellow-100 text-xs vertical-tablet:text-sm horizontal-mobile:!text-[10px] uppercase tracking-wide">
            {level
              ? t('home.points.level', lang).replace('{n}', String(level))
              : t('home.points.level', lang).replace('{n}', '1')}
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeNext}
        aria-valuenow={safePoints}
        className="relative z-10 mt-3 vertical-tablet:mt-4 horizontal-mobile:!mt-2 h-2.5 vertical-tablet:h-3 horizontal-mobile:!h-2 w-full rounded-full bg-white/20 overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="h-full rounded-full bg-gradient-to-r from-km0-yellow-400 to-km0-teal-400"
        />
      </div>

      {/* Fila inferior: regalo + recompensa */}
      {nextReward && (
        <div className="relative z-10 mt-3 vertical-tablet:mt-4 horizontal-mobile:!mt-2 flex items-start gap-2.5">
          <span className="shrink-0 w-7 h-7 vertical-tablet:w-8 vertical-tablet:h-8 horizontal-mobile:!w-6 horizontal-mobile:!h-6 rounded-full bg-white/15 flex items-center justify-center">
            <Gift className="w-3.5 h-3.5 vertical-tablet:w-4 vertical-tablet:h-4 horizontal-mobile:!w-3 horizontal-mobile:!h-3 text-km0-yellow-100" />
          </span>
          <p className="font-body text-xs vertical-tablet:text-sm horizontal-mobile:!text-[11px] text-white/90 leading-snug">
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
