import { t, useShopPromotions } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion } from 'framer-motion'
import { ArrowRight, Tag, Lock } from 'lucide-react'

import ScreenStatus from '@/components/ScreenStatus'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * MerchantPromosPreview — sección Home con las primeras promocions de
 * comerços adherits. Reutiliza el estilo de la tab "promos" de `/rewards`
 * en versión compacta. Cuando `locked`, aplica overlay + CTA de registro.
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
  const l = lang === 'en' ? 'es' : lang
  const handleSeeAll = locked ? onLogin : onSeeAll

  const { promotions, loading, error, reload } = useShopPromotions()
  const rows = promotions.slice(0, 4)

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('w-full space-y-3', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-brand font-black text-km0-blue-800 text-lg flex items-center gap-2">
          {t('home.section.promos', lang)}
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
            {t('home.action.see_all_f', lang)}
            <ArrowRight size={13} strokeWidth={2.4} />
          </Button>
        )}
      </div>

      {loading || error || !rows.length ? (
        <ScreenStatus
          state={loading ? 'loading' : error ? 'error' : 'empty'}
          emptyKey="rewards.promos.empty"
          onRetry={reload}
        />
      ) : (
        <ul
          className={cn(
            'flex flex-col gap-2.5',
            locked && 'pointer-events-none opacity-60'
          )}
          aria-hidden={locked || undefined}
        >
          {rows.map((row, i) => (
            <motion.li
              key={`${row.shopName}-${row.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.05, 0.2) }}
              className="rounded-[20px] bg-card shadow-[var(--shadow-bubble)] p-3 flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'shrink-0 w-12 h-12 rounded-full flex items-center justify-center overflow-hidden',
                    'bg-km0-yellow-100'
                  )}
                >
                  {row.shopImage ? (
                    <img
                      src={row.shopImage}
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
                  <p className="font-body text-xs text-km0-blue-800/70">
                    {t('rewards.promos.at', lang).replace(
                      '{shop}',
                      row.shopName
                    )}
                  </p>
                  <h3 className="font-ui font-bold text-sm text-km0-blue-900 leading-tight">
                    {row.titol[l]}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-ui font-black bg-km0-coral-400 text-primary-foreground">
                  {row.etiqueta}
                </span>
              </div>
              <p className="font-body text-[11px] text-km0-blue-800/70 leading-snug line-clamp-2 flex items-start gap-1">
                <Tag
                  size={10}
                  className="mt-0.5 shrink-0 text-km0-blue-800/50"
                />
                <span>{row.detall[l]}</span>
              </p>
            </motion.li>
          ))}
        </ul>
      )}

      {locked && onLogin && (
        <Button
          variant="bubbleLink"
          type="button"
          onClick={onLogin}
          className="w-full rounded-full bg-km0-blue-800 text-primary-foreground font-ui font-bold text-sm py-2.5 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
        >
          <Lock size={14} strokeWidth={2.4} />
          {t('home.locked.cta', lang)}
        </Button>
      )}
    </motion.section>
  )
}

export default MerchantPromosPreview
