import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Promo } from '@km0lab/app'

/**
 * PromoCarousel — carrusel de promos/eventos con flechas izq/der,
 * dots clicables y soporte de swipe táctil (drag) vía framer-motion.
 *
 * Componente "tonto": recibe `promos` por props y no conoce nada
 * de la página que lo monta. Listo para tests unitarios.
 */
export interface PromoCarouselProps {
  promos: Promo[]
}

const PromoCarousel = ({ promos }: PromoCarouselProps) => {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const total = promos.length

  if (total === 0) return null

  const goTo = (next: number) => {
    const safe = (next + total) % total
    setDirection(safe > index || (index === total - 1 && safe === 0) ? 1 : -1)
    setIndex(safe)
  }
  const prev = () => goTo(index - 1)
  const next = () => goTo(index + 1)

  const promo = promos[index]
  const isFirst = index === 0
  const isLast = index === total - 1

  return (
    <>
      {/* Hero card con drag horizontal */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_10px_24px_-12px_hsl(var(--km0-blue-700)/0.35)] aspect-[2/1]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={promo.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) next()
              else if (info.offset.x > 50) prev()
            }}
            className={cn(
              'absolute inset-0 bg-gradient-to-br cursor-grab active:cursor-grabbing',
              promo.gradient
            )}
          >
            {/* Decoración: círculos de "fuegos artificiales" */}
            <div className="absolute top-3 left-4 w-2 h-2 rounded-full bg-km0-yellow-400 shadow-[0_0_12px_hsl(var(--km0-yellow-400))]" />
            <div className="absolute top-6 left-12 w-1.5 h-1.5 rounded-full bg-km0-coral-400" />
            <div className="absolute top-4 right-16 w-2 h-2 rounded-full bg-km0-yellow-400 shadow-[0_0_12px_hsl(var(--km0-yellow-400))]" />
            <div className="absolute top-10 right-6 w-1.5 h-1.5 rounded-full bg-white" />

            {/* Texto principal — legacy renderer, ahora simplificado a
                la nueva forma del tipo Promo (título + fecha). */}
            <div className="absolute inset-0 flex flex-col justify-center px-5 pointer-events-none select-none">
              <span className="font-brand text-2xl font-black leading-tight text-white whitespace-pre-line">
                {promo.title}
              </span>
              <span className="font-ui text-xs text-white/90 mt-2 tracking-wider">
                {promo.dateRange} · {promo.location}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Botón anterior — solo visible si no es el primero */}
        {!isFirst && (
          <button
            type="button"
            onClick={prev}
            aria-label="Promo anterior"
            className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 hover:scale-105 transition-transform z-10"
          >
            <ChevronLeft
              size={18}
              className="text-km0-blue-700"
              strokeWidth={2.4}
            />
          </button>
        )}

        {/* Botón siguiente — solo visible si no es el último */}
        {!isLast && (
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente promo"
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 hover:scale-105 transition-transform z-10"
          >
            <ChevronRight
              size={18}
              className="text-km0-blue-700"
              strokeWidth={2.4}
            />
          </button>
        )}
      </div>

      {/* Dots de paginación — clicables */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {promos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a la promo ${i + 1}`}
            className={cn(
              'rounded-full transition-all',
              i === index
                ? 'w-5 h-1.5 bg-km0-blue-700'
                : 'w-1.5 h-1.5 bg-km0-blue-700/25 hover:bg-km0-blue-700/50'
            )}
          />
        ))}
      </div>
    </>
  )
}

export default PromoCarousel
