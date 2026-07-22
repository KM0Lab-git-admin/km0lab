import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, MapPin, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Promo } from '@km0lab/app'

import { cn } from '@/lib/utils'

/**
 * EventHeroCarousel — hero de "Eventos destacados".
 *
 * Cada slide está compuesto por:
 *  - Zona superior: carrusel de imágenes del evento (dots internos).
 *  - Zona inferior: panel con título, fecha, ubicación y CTA circular.
 *
 * Swipe horizontal sobre la card = cambia de evento.
 * Dots inferiores del panel = cambian de evento (paginación externa).
 * Dots sobre la imagen = cambian de imagen dentro del mismo evento.
 */
export interface EventHeroCarouselProps {
  promos: Promo[]
  onOpen?: (id: string) => void
}

const EventHeroCarousel = ({ promos, onOpen }: EventHeroCarouselProps) => {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [imgIndex, setImgIndex] = useState(0)
  const total = promos.length

  // Al cambiar de evento, reiniciamos la imagen visible.
  useEffect(() => {
    setImgIndex(0)
  }, [index])

  if (total === 0) return null

  const goTo = (next: number) => {
    const safe = (next + total) % total
    setDirection(safe > index || (index === total - 1 && safe === 0) ? 1 : -1)
    setIndex(safe)
  }

  const promo = promos[index]
  const images = promo.images ?? []
  const hasImages = images.length > 0
  const currentImage = hasImages ? images[imgIndex % images.length] : null

  return (
    <div className="w-full">
      <div className="relative w-full rounded-2xl overflow-hidden bg-card shadow-[0_12px_28px_-14px_hsl(var(--km0-blue-900)/0.35)] ring-1 ring-km0-beige-200">
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
              if (info.offset.x < -50) goTo(index + 1)
              else if (info.offset.x > 50) goTo(index - 1)
            }}
            className="flex flex-col cursor-grab active:cursor-grabbing"
          >
            {/* --- Zona imagen (clic = abrir detalle) --- */}
            <button
              type="button"
              onClick={() => onOpen?.(promo.id)}
              aria-label={`Obrir ${promo.title.replace(/\n/g, ' ')}`}
              className={cn(
                'relative w-full aspect-[16/10] bg-gradient-to-br overflow-hidden text-left',
                promo.gradient
              )}
            >
              {currentImage && (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={promo.title.replace(/\n/g, ' ')}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </AnimatePresence>
              )}

              {/* Overlay inferior para lecturabilidad si algún día ponemos texto encima */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
              />

              {/* Dots internos de imagen */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/35 backdrop-blur-sm px-2 py-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImgIndex(i)
                      }}
                      aria-label={`Imatge ${i + 1}`}
                      className={cn(
                        'rounded-full transition-all',
                        i === imgIndex % images.length
                          ? 'w-4 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/80'
                      )}
                    />
                  ))}
                </div>
              )}
            </button>

            {/* --- Panel de texto (clic = abrir detalle) --- */}
            <div className="relative flex items-end gap-3 px-4 pt-3 pb-4 vertical-tablet:px-5 vertical-tablet:pt-4 vertical-tablet:pb-5">
              <button
                type="button"
                onClick={() => onOpen?.(promo.id)}
                aria-label={`Obrir ${promo.title.replace(/\n/g, ' ')}`}
                className="flex-1 min-w-0 select-none text-left"
              >
                <h3 className="font-brand font-black text-km0-blue-800 leading-[1.05] whitespace-pre-line text-xl vertical-tablet:text-2xl">
                  {promo.title}
                </h3>
                <div className="mt-2 flex flex-col gap-1 font-body text-km0-blue-700/85 text-xs vertical-tablet:text-sm">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays
                      size={14}
                      className="shrink-0"
                      strokeWidth={2.2}
                    />
                    {promo.dateRange}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="shrink-0" strokeWidth={2.2} />
                    {promo.location}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(index + 1)
                }}
                aria-label="Següent esdeveniment"
                className="shrink-0 w-11 h-11 rounded-full bg-km0-blue-700 text-white shadow-[0_6px_14px_-4px_hsl(var(--km0-blue-900)/0.55)] flex items-center justify-center active:scale-95 hover:scale-105 transition-transform"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots externos: paginación entre eventos */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {promos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Anar a l'esdeveniment ${i + 1}`}
            className={cn(
              'rounded-full transition-all',
              i === index
                ? 'w-5 h-1.5 bg-km0-blue-700'
                : 'w-1.5 h-1.5 bg-km0-blue-700/25 hover:bg-km0-blue-700/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default EventHeroCarousel
