import { t, useHomeRewards } from '@km0lab/app'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Coins,
  Gift,
  Percent,
  RefreshCw,
  ShoppingBag,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import type { RewardKind } from '@km0lab/app'

import RewardCover from '@/components/RewardCover'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * RewardsPreview — hero de "Premis" en la Home. Mismo formato visual
 * que EventHeroCarousel: portada arriba, panel inferior con título,
 * metadatos y CTA circular, más dots externos de paginación.
 *
 * Incluye el wrapper de sección. Si el municipio no tiene premios
 * se muestra el bloque con estado vacío (no se oculta).
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

const RewardsPreview = ({ onSeeAll, className }: RewardsPreviewProps) => {
  const { lang } = useLang()
  const { rewards, loading, error, reload } = useHomeRewards()
  const items = rewards.filter((r) => r.status === 'active').slice(0, 5)
  const itemIds = items.map((r) => r.id).join('|')
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const total = items.length

  useEffect(() => {
    setIndex(0)
  }, [itemIds])

  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1)
  const goTo = (next: number) => {
    if (total === 0) return
    const safe = (next + total) % total
    setDirection(
      safe > safeIndex || (safeIndex === total - 1 && safe === 0) ? 1 : -1
    )
    setIndex(safe)
  }

  const reward = items[safeIndex]
  const Icon = reward ? KIND_ICON[reward.kind] : Gift
  const gradient = reward ? KIND_GRADIENT[reward.kind] : KIND_GRADIENT.voucher

  return (
    <section
      className={cn(
        'rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-6 py-6 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-brand font-black text-km0-blue-800 text-base">
          {t('home.section.rewards', lang)}
        </h2>
        {onSeeAll && !loading && !error && (
          <button
            type="button"
            onClick={onSeeAll}
            className="font-ui font-bold text-km0-coral-400 active:scale-95 transition-transform underline underline-offset-4 text-xs gap-0 flex items-center justify-start whitespace-nowrap shrink-0"
          >
            {t('home.action.see_all_m', lang)}
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {loading ? (
        <p className="font-body text-sm text-km0-blue-800/60 py-8 text-center">
          {t('common.loading', lang)}
        </p>
      ) : error ? (
        <div className="py-6 text-center space-y-3">
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
      ) : total === 0 ? (
        <p className="font-body text-sm text-km0-blue-800/60 py-8 text-center">
          {t('rewards.empty', lang)}
        </p>
      ) : (
        <div className="w-full">
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
                <button
                  type="button"
                  onClick={onSeeAll}
                  aria-label={reward.title}
                  className={cn(
                    'relative w-full aspect-hero-cover bg-gradient-to-br overflow-hidden text-left flex items-center justify-center',
                    gradient
                  )}
                >
                  <RewardCover
                    imageUrl={reward.imageUrl}
                    fallback={
                      <Icon
                        size={96}
                        strokeWidth={1.6}
                        className="text-km0-blue-900/85"
                      />
                    }
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 text-km0-blue-900 px-2.5 py-1 text-[11px] font-ui font-black inline-flex items-center gap-1 tabular-nums shadow-sm">
                    <Coins size={12} strokeWidth={2.4} />
                    {t('rewards.cost', lang).replace(
                      '{n}',
                      fmt(reward.costPoints)
                    )}
                  </span>
                </button>

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
                      <span className="font-ui font-bold text-km0-blue-900">
                        {reward.valueLabel}
                      </span>
                      <span className="line-clamp-1">{reward.scope}</span>
                    </div>
                  </button>

                  {total > 1 && (
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
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {total > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {items.map((_, i) => (
                <button
                  key={items[i].id}
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
          )}
        </div>
      )}
    </section>
  )
}

export default RewardsPreview
