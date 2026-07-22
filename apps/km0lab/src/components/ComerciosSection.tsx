import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import ComercioCarousel from './ComercioCarousel'

import type { Comercio } from '@km0lab/app'

import couponIcon from '@/assets/coupon-icon.png'

/**
 * ComerciosSection — wrapper visual de la sección "Esto es para ti".
 * Incluye icono de cupón, título, link "Ver todos" y el carrusel
 * de comercios.
 */
export interface ComerciosSectionProps {
  comercios: Comercio[]
  title?: string
  onSeeAll?: () => void
  animationDelay?: number
}

const ComerciosSection = ({
  comercios,
  title = 'Esto es para ti',
  onSeeAll,
  animationDelay = 0.34,
}: ComerciosSectionProps) => {
  return (
    <motion.section
      className="m-0 p-0 horizontal-mobile:min-w-0 horizontal-mobile:flex horizontal-mobile:flex-col horizontal-mobile:h-full horizontal-desktop:min-w-0 horizontal-desktop:flex horizontal-desktop:flex-col horizontal-desktop:h-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <div className="flex items-center w-full justify-between mb-[clamp(0.125rem,1vw,0.875rem)] vertical-tablet:mb-3 horizontal-mobile:!mb-1 horizontal-mobile:h-6 horizontal-desktop:!mb-2 gap-2 horizontal-mobile:!gap-1">
        <div className="flex items-center gap-2 horizontal-mobile:gap-1 min-w-0">
          <img
            src={couponIcon}
            alt=""
            aria-hidden
            width={80}
            height={80}
            loading="lazy"
            className="w-12 h-12 horizontal-mobile:!hidden object-contain shrink-0"
          />
          <h2 className="font-brand font-black text-km0-blue-700 whitespace-nowrap text-xs vertical-tablet:text-base horizontal-mobile:!text-xs horizontal-desktop:!text-lg">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-ui font-bold text-km0-coral-400 flex items-center gap-1 active:scale-95 transition-transform shrink-0 underline underline-offset-4 text-xs vertical-tablet:text-base horizontal-mobile:!text-xs horizontal-desktop:!text-lg"
        >
          Ver todos
          <ArrowRight
            size={14}
            strokeWidth={2.4}
            className="horizontal-mobile:!w-3 horizontal-mobile:!h-3"
          />
        </button>
      </div>

      <div className="horizontal-desktop:bg-white/30 horizontal-desktop:rounded-2xl horizontal-desktop:p-3 horizontal-desktop:flex-1 horizontal-desktop:min-h-0 horizontal-desktop:w-full horizontal-desktop:flex horizontal-desktop:items-center horizontal-mobile:bg-white/30 horizontal-mobile:rounded-xl horizontal-mobile:p-1 horizontal-mobile:flex-1 horizontal-mobile:min-h-0 horizontal-mobile:w-full horizontal-mobile:flex horizontal-mobile:items-center">
        <div className="w-full">
          <ComercioCarousel comercios={comercios} />
        </div>
      </div>
    </motion.section>
  )
}

export default ComerciosSection
