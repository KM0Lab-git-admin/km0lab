import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

import type { Comercio } from '@km0lab/app'

import { cn } from '@/lib/utils'

/**
 * ComercioCarousel — carrusel paginado de logos de comercios con
 * swipe táctil y dots clicables. Muestra `perPage` comercios por
 * página en una grid de 4 columnas.
 *
 * Componente "tonto": recibe `comercios` por props y no conoce
 * nada de la página que lo monta. Listo para tests unitarios.
 */
export interface ComercioCarouselProps {
  comercios: Comercio[]
  /** Comerciantes por página. Por defecto 4 (1 fila × 4 cols). */
  perPage?: number
}

const ComercioCarousel = ({
  comercios,
  perPage = 4,
}: ComercioCarouselProps) => {
  const pages: Comercio[][] = []
  for (let i = 0; i < comercios.length; i += perPage) {
    pages.push(comercios.slice(i, i + perPage))
  }
  const total = pages.length
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  if (total === 0) return null

  const goTo = (next: number) => {
    const safe = Math.max(0, Math.min(total - 1, next))
    setDirection(safe >= page ? 1 : -1)
    setPage(safe)
  }

  const currentPage = pages[page]

  return (
    <div>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 && page < total - 1) goTo(page + 1)
              else if (info.offset.x > 50 && page > 0) goTo(page - 1)
            }}
            className="grid grid-cols-4 items-start gap-2 cursor-grab active:cursor-grabbing"
          >
            {currentPage.map((c) => (
              <button
                type="button"
                key={c.id}
                className="flex flex-col items-center active:scale-95 transition-transform"
              >
                <div
                  className={cn(
                    'w-[clamp(2.25rem,8vw,3.5rem)] h-[clamp(2.25rem,8vw,3.5rem)] rounded-full shadow-sm border-2 border-white flex items-center justify-center overflow-hidden',
                    c.bg
                  )}
                >
                  <img
                    src={c.logo}
                    alt={c.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-full h-full object-contain p-1.5 pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
                <span className="font-body text-[10px] leading-tight text-km0-blue-800 mt-[clamp(0.125rem,0.5vw,0.375rem)] truncate w-full text-center">
                  {c.name}
                </span>
              </button>
            ))}
            {/* Rellena huecos vacíos para mantener la grid alineada */}
            {currentPage.length < perPage &&
              Array.from({ length: perPage - currentPage.length }).map(
                (_, i) => <div key={`empty-${i}`} aria-hidden />
              )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ComercioCarousel
