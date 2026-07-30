import { t, useHomeRewards } from '@km0lab/app'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  Gift,
  Ticket,
  Percent,
  ShoppingBag,
  Coins,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import type { Reward, RewardKind } from '@km0lab/app'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * RewardsPreview — hero de "Premis" en la Home. Mismo formato visual
 * que EventHeroCarousel: portada arriba, panel inferior con título,
 * metadatos y CTA circular, más dots externos de paginación.
 *
 * Fuente: GET /rewards/public?postal_code={cp}&lang={lang}
 * (pueblo del CP + textos traducidos por la API + imagen de media).
 *
 * El wrapper (section + SectionHeader) lo aporta HomeContent para que
 * sea idéntico al de "Eventos destacados".
 */
export interface RewardsPreviewProps {
  onSeeAll?: () => void
  className?: string
}

const KIND_ICON: Record<RewardKind, LucideIcon> = {
  voucher: Gift,
  ticket: Ticket,
  product: ShoppingBag,
  discount: Percent,
}

const KIND_GRADIENT: Record<RewardKind, string> = {
  voucher: 'from-km0-yellow-200 to-km0-yellow-400',
  ticket: 'from-km0-teal-200 to-km0-teal-400',
  product: 'from-km0-coral-200 to-km0-coral-400',
  discount: 'from-km0-blue-200 to-km0-blue-400',
}

const fmt = (n: number) => n.toLocaleString('es-ES')

const CoverFallback = ({ reward }: { reward: Reward }) => {
  const Icon = KIND_ICON[reward.kind]
  return <Icon size={96} strokeWidth={1.6} className="text-km0-blue-900/85" />
}

const RewardsPreview = ({ onSeeAll, className }: RewardsPreviewProps) => {
  const { lang } = useLang()
  const { rewards, loading, error } = useHomeRewards()
  const items = rewards.slice(0, 5)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [imgFailed, setImgFailed] = useState(false)
  const total = items.length

  // Sin premios (error / vacío / sin CP): no pintar la sección.
  if (!loading && (error || total === 0)) {
    return null
  }

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="relative w-full rounded-2xl overflow-hidden bg-card shadow-[0_12px_28px_-14px_hsl(var(--km0-blue-900)/0.35)] ring-1 ring-km0-beige-200 animate-pulse">
          <div className="w-full aspect-[16/10] bg-km0-beige-100" />
          <div className="px-4 pt-3 pb-4 space-y-2">
            <span className="block h-5 w-2/3 rounded bg-km0-beige-100" />
            <span className="block h-3 w-1/3 rounded bg-km0-beige-100" />
            <span className="block h-3 w-1/2 rounded bg-km0-beige-100" />
          </div>
        </div>
      </div>
    )
  }

  const safeIndex = Math.min(index, total - 1)
  const goTo = (next: number) => {
    const safe = (next + total) % total
    setDirection(
      safe > safeIndex || (safeIndex === total - 1 && safe === 0) ? 1 : -1
    )
    setImgFailed(false)
    setIndex(safe)
  }

  const reward = items[safeIndex]
  const gradient = KIND_GRADIENT[reward.kind]
  const showImage = Boolean(reward.hasImage && reward.imageUrl && !imgFailed)

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full rounded-2xl overflow-hidden bg-card shadow-[0_12px_28px_-14px_hsl(var(--km0-blue-900)/0.35)] ring-1 ring-km0-beige-200">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={reward.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) goTo(safeIndex + 1)
              else if (info.offset.x > 50) goTo(safeIndex - 1)
            }}
            className="flex flex-col cursor-grab active:cursor-grabbing"
          >
            {/* Zona portada */}
            <button
              type="button"
              onClick={onSeeAll}
              aria-label={reward.title}
              className={cn(
                'relative w-full aspect-[16/10] bg-gradient-to-br overflow-hidden text-left flex items-center justify-center',
                gradient
              )}
            >
              {showImage ? (
                <img
                  src={reward.imageUrl!}
                  alt={reward.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <CoverFallback reward={reward} />
              )}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
              />
              <span className="absolute top-3 left-3 rounded-full bg-white/90 text-km0-blue-900 px-2.5 py-1 text-[11px] font-ui font-black inline-flex items-center gap-1 tabular-nums shadow-sm">
                <Coins size={12} strokeWidth={2.4} />
                {t('rewards.cost', lang).replace('{n}', fmt(reward.costPoints))}
              </span>
            </button>

            {/* Panel de texto */}
            <div className="relative flex items-end gap-3 px-4 pt-3 pb-4">
              <button
                type="button"
                onClick={onSeeAll}
                aria-label={reward.title}
                className="flex-1 min-w-0 select-none text-left"
              >
                <h3 className="font-brand font-black text-km0-blue-800 leading-[1.05] text-xl line-clamp-2">
                  {reward.title}
                </h3>
                <div className="mt-2 flex flex-col gap-1 font-body text-km0-blue-700/85 text-xs">
                  {reward.valueLabel ? (
                    <span className="font-ui font-bold text-km0-blue-900">
                      {reward.valueLabel}
                    </span>
                  ) : null}
                  <span className="line-clamp-1">{reward.scope}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(safeIndex + 1)
                }}
                aria-label="Següent premi"
                className="shrink-0 w-11 h-11 rounded-full bg-km0-blue-700 text-white shadow-[0_6px_14px_-4px_hsl(var(--km0-blue-900)/0.55)] flex items-center justify-center active:scale-95 hover:scale-105 transition-transform"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots externos */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Anar al premi ${i + 1}`}
            className={cn(
              'rounded-full transition-all',
              i === safeIndex
                ? 'w-5 h-1.5 bg-km0-blue-700'
                : 'w-1.5 h-1.5 bg-km0-blue-700/25 hover:bg-km0-blue-700/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default RewardsPreview
