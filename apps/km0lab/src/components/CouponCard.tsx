import { t } from '@km0lab/app'
import { motion } from 'framer-motion'
import { ChevronRight, Percent, Gift, Ticket, Lock } from 'lucide-react'

import type { Coupon } from '@km0lab/app'

import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/**
 * CouponCard — tarjeta horizontal para "Bescanvia amb punts".
 *
 * Estructura:
 *   ┌──────────────────────────────────────────────┐
 *   │ [valor]  Título principal                [🔒]│
 *   │          Subtítulo                           │
 *   └──────────────────────────────────────────────┘
 *
 * El icono puede mostrar el valor del descuento (ej.: "-20%", "5€")
 * o un icono genérico según el tipo. Si el cupón está bloqueado se
 * muestra un candado y un mensaje de invitación a registrarse.
 */
export interface CouponCardProps {
  coupon: Coupon
  onClick?: () => void
  delay?: number
}

const ICON_BY_KIND = {
  percent: Percent,
  gift: Gift,
  ticket: Ticket,
} as const

const STYLE_BY_KIND = {
  percent: { bg: 'bg-km0-coral-100', fg: 'text-km0-coral-500' },
  gift: { bg: 'bg-km0-yellow-100', fg: 'text-km0-yellow-600' },
  ticket: { bg: 'bg-km0-teal-100', fg: 'text-km0-teal-700' },
} as const

const CouponCard = ({ coupon, onClick, delay = 0 }: CouponCardProps) => {
  const { lang } = useLang()
  const Icon = ICON_BY_KIND[coupon.kind ?? 'percent']
  const style = STYLE_BY_KIND[coupon.kind ?? 'percent']
  const costLabel =
    coupon.costPoints != null && !coupon.locked
      ? t('home.redeem.cost', lang).replace(
          '{n}',
          coupon.costPoints.toLocaleString('es-ES')
        )
      : null
  const subtitle = coupon.locked
    ? t('home.redeem.locked', lang)
    : coupon.validity

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="w-full rounded-2xl bg-secondary border border-border shadow-[0_4px_14px_-8px_hsl(var(--km0-blue-900)/0.2)] px-3 py-2.5 flex items-center gap-3 active:scale-[0.99] hover:bg-km0-beige-50 transition-all text-left"
    >
      <span
        className={cn(
          'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
          coupon.value ? 'bg-km0-yellow-100' : style.bg
        )}
      >
        {coupon.value ? (
          <span className="font-ui font-black text-km0-blue-800 text-[11px]">
            {coupon.value}
          </span>
        ) : (
          <Icon size={22} strokeWidth={2.4} className={cn(style.fg)} />
        )}
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="font-ui font-bold text-km0-blue-800 text-sm leading-tight truncate">
          {coupon.title}
        </span>
        <span
          className={cn(
            'font-body text-[11px] leading-tight truncate',
            coupon.locked ? 'text-km0-blue-700/60' : 'text-km0-blue-700/70'
          )}
        >
          {subtitle}
        </span>
      </div>

      {coupon.locked ? (
        <Lock
          size={18}
          strokeWidth={2.4}
          className="shrink-0 text-km0-blue-700/40"
        />
      ) : costLabel ? (
        <span className="shrink-0 rounded-full bg-km0-yellow-100 text-km0-yellow-700 font-ui font-bold text-[11px] px-2.5 py-1 whitespace-nowrap">
          {costLabel}
        </span>
      ) : (
        <ChevronRight
          size={18}
          strokeWidth={2.4}
          className="shrink-0 text-km0-blue-700/60"
        />
      )}
    </motion.button>
  )
}

export default CouponCard
