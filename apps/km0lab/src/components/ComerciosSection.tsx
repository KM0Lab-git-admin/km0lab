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
      className="m-0 p-0"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <div className="flex items-center w-full justify-between mb-[clamp(0.125rem,1vw,0.875rem)] gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={couponIcon}
            alt=""
            aria-hidden
            width={80}
            height={80}
            loading="lazy"
            className="w-12 h-12 object-contain shrink-0"
          />
          <h2 className="font-brand font-black text-km0-blue-700 whitespace-nowrap text-xs">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="font-ui font-bold text-km0-coral-400 flex items-center gap-1 active:scale-95 transition-transform shrink-0 underline underline-offset-4 text-xs"
        >
          Ver todos
          <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      </div>

      <div>
        <div className="w-full">
          <ComercioCarousel comercios={comercios} />
        </div>
      </div>
    </motion.section>
  )
}

export default ComerciosSection
