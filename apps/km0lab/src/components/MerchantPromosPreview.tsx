import { motion } from 'framer-motion'
import { ArrowRight, Tag, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang } from '@/contexts/LangContext'
import { t, useShopPromotions } from '@km0lab/app'

/**
 * MerchantPromosPreview — sección Home con las primeras promocions de
 * comerços adherits (GET /promotions/public + join shops).
 * Cuando `locked`, aplica overlay + CTA de registro.
 */
export interface MerchantPromosPreviewProps {
  onSeeAll?: () => void
  locked?: boolean
  onLogin?: () => void
  className?: string
}

const MerchantPromosPreview = ({
  onSeeAll,
  locked = false,
  onLogin,
  className,
}: MerchantPromosPreviewProps) => {
  const { lang } = useLang()
  const { promotions, loading, error } = useShopPromotions()
  const rows = promotions.slice(0, 4)
  const handleSeeAll = locked ? onLogin : onSeeAll

  if (!loading && (error || rows.length === 0)) {
    return null
  }

  if (loading) {
    return (
      <section
        className={cn(
          'w-full rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-4 py-4 space-y-3',
          className
        )}
      >
        <div className="h-5 w-1/2 rounded bg-km0-beige-100 animate-pulse" />
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-km0-blue-100 p-3 h-16 animate-pulse"
            />
          ))}
        </div>
      </section>
    )
  }

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
          {t('home.section.promos', lang)}
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-km0-blue-800/85 text-white px-2 py-0.5 text-[10px] font-ui font-bold uppercase tracking-wide">
              <Lock size={10} strokeWidth={2.4} />
              {t('home.locked.badge', lang)}
            </span>
          )}
        </h2>
        {handleSeeAll && (
          <button
            type="button"
            onClick={handleSeeAll}
            className="font-ui font-bold text-km0-coral-400 active:scale-95 transition-transform underline underline-offset-4 text-xs flex items-center whitespace-nowrap shrink-0"
          >
            {t('home.action.see_all_f', lang)}
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <ul
        className={cn(
          'flex flex-col gap-2.5',
          locked && 'pointer-events-none opacity-60'
        )}
        aria-hidden={locked || undefined}
      >
        {rows.map((row, i) => (
          <motion.li
            key={row.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.2) }}
            className="rounded-2xl bg-white border border-km0-blue-100 shadow-[0_8px_20px_-14px_hsl(var(--km0-blue-900)/0.35)] p-3 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-km0-blue-100 bg-km0-beige-100">
                {row.shopImageUrl ? (
                  <img
                    src={row.shopImageUrl}
                    alt=""
                    aria-hidden
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-base" aria-hidden>
                    {row.shopEmoji ?? '🛍️'}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                {row.shopName ? (
                  <p className="font-body text-[10px] uppercase tracking-wide text-km0-blue-800/60 truncate">
                    {t('rewards.promos.at', lang).replace(
                      '{shop}',
                      row.shopName
                    )}
                  </p>
                ) : null}
                <h3 className="font-brand font-black text-xs text-km0-blue-900 leading-tight truncate">
                  {row.title}
                </h3>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-ui font-black bg-km0-coral-400 text-white">
                {row.label}
              </span>
            </div>
            <p className="font-body text-[11px] text-km0-blue-800/70 leading-snug line-clamp-2 flex items-start gap-1">
              <Tag size={10} className="mt-0.5 shrink-0 text-km0-blue-800/50" />
              <span>{row.detail}</span>
            </p>
          </motion.li>
        ))}
      </ul>

      {locked && onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className="w-full rounded-full bg-km0-blue-800 text-white font-ui font-bold text-sm py-2.5 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
        >
          <Lock size={14} strokeWidth={2.4} />
          {t('home.locked.cta', lang)}
        </button>
      )}
    </motion.section>
  )
}

export default MerchantPromosPreview
