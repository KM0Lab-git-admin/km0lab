import { motion } from 'framer-motion'

import PromoCarousel from './PromoCarousel'

import type { Promo } from '@km0lab/app'

/**
 * PromoSection — wrapper visual de la sección "Promos y eventos
 * destacados". Encapsula título + PromoCarousel para que el Home
 * solo tenga que pasar los datos.
 */
export interface PromoSectionProps {
  promos: Promo[]
  title?: string
  /** Delay del fade-in para coreografiar entradas. */
  animationDelay?: number
}

const PromoSection = ({
  promos,
  title = 'Promos y eventos destacados',
  animationDelay = 0.26,
}: PromoSectionProps) => {
  return (
    <motion.section
      className="m-0 p-0 horizontal-mobile:min-w-0 horizontal-mobile:flex horizontal-mobile:flex-col horizontal-mobile:h-full horizontal-desktop:min-w-0 horizontal-desktop:flex horizontal-desktop:flex-col horizontal-desktop:h-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animationDelay }}
    >
      <div className="flex items-center min-h-12 horizontal-mobile:!min-h-0 horizontal-mobile:h-6 mb-[clamp(0.125rem,1vw,0.875rem)] vertical-tablet:mb-3 horizontal-mobile:!mb-1 horizontal-desktop:!mb-2">
        <h2 className="font-brand font-black text-km0-blue-700 text-sm vertical-tablet:text-base horizontal-mobile:!text-xs horizontal-desktop:!text-lg">
          {title}
        </h2>
      </div>
      <PromoCarousel promos={promos} />
    </motion.section>
  )
}

export default PromoSection
