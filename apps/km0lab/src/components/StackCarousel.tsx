import { useState, useRef, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * StackCarousel — carrusel reutilizable con efecto "stack" (pila 3D):
 * la slide central está en primer plano, las laterales encogidas y
 * desplazadas hacia abajo.
 *
 * Maqueta ÚNICA portrait: el carrusel se ve igual en cualquier
 * resolución y orientación del dispositivo, porque vive dentro del marco
 * fijo (~420px). No mide `window`; el ancho de slot es constante.
 *
 * Soporta:
 *  - drag/swipe con pointer events
 *  - flechas prev/next
 *  - thumbnails y dots
 *  - botón de cierre (SKIP / START / FINISH) configurable
 *
 * Contenido de cada slide vía render props (`renderSlideContent` y
 * `renderThumbnail`), para que sea agnóstico al dominio (onboarding,
 * carrusel de eventos, tutoriales, etc.).
 */
export interface StackCarouselItem {
  id: string | number
  /** Color de fondo para el header de la card (CSS color o var(--token)) */
  color: string
  /** Contenido del thumbnail (normalmente un emoji o icono pequeño) */
  thumb: ReactNode
}

export interface StackCarouselRenderContext {
  isActive: boolean
  index: number
}

export interface StackCarouselProps<T extends StackCarouselItem> {
  items: T[]
  /** Render del cuerpo interior de la card (image area + texto) */
  renderSlideContent: (item: T, ctx: StackCarouselRenderContext) => ReactNode
  /** Render opcional del thumbnail. Default: `item.thumb` */
  renderThumbnail?: (item: T, ctx: StackCarouselRenderContext) => ReactNode
  /** Texto del botón derecho cuando NO estás en la última slide */
  skipLabel?: string
  /** Texto del botón derecho cuando estás en la última slide */
  finishLabel?: string
  /** Callback al pulsar el botón de la última slide */
  onFinish?: () => void
  /** Index inicial (uncontrolled) */
  defaultIndex?: number
  /** Index controlado (opcional) */
  index?: number
  onIndexChange?: (i: number) => void
}

const SLOT = 260

function StackCarousel<T extends StackCarouselItem>({
  items,
  renderSlideContent,
  renderThumbnail,
  skipLabel = 'SKIP',
  finishLabel = 'START',
  onFinish,
  defaultIndex = 0,
  index,
  onIndexChange,
}: StackCarouselProps<T>) {
  const [internalIndex, setInternalIndex] = useState(defaultIndex)
  const current = index ?? internalIndex
  const setCurrent = (i: number | ((prev: number) => number)) => {
    const next = typeof i === 'function' ? i(current) : i
    if (index === undefined) setInternalIndex(next)
    onIndexChange?.(next)
  }

  const [dragOffset, setDragOffset] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const total = items.length
  const isFirst = current === 0
  const isLast = current === total - 1

  const prev = () => {
    if (!isFirst) setCurrent((c) => c - 1)
  }
  const next = () => {
    if (!isLast) setCurrent((c) => c + 1)
  }
  const goTo = (i: number) => setCurrent(i)

  const pointerHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      touchStartX.current = e.clientX
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (touchStartX.current === null) return
      setDragOffset(e.clientX - touchStartX.current)
    },
    onPointerUp: (e: React.PointerEvent) => {
      const el = e.currentTarget as HTMLElement
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId)
      if (touchStartX.current === null) return
      const delta = touchStartX.current - e.clientX
      touchStartX.current = null
      setDragOffset(0)
      if (Math.abs(delta) > 40) {
        if (delta > 0) next()
        else prev()
      }
    },
  }

  const trackX = -(current * SLOT + SLOT / 2)

  const handleSkip = () => {
    onFinish?.()
  }

  const buttonLabel = isLast ? finishLabel : skipLabel

  return (
    <div className="w-full max-w-[390px] mx-auto flex flex-col gap-3 overflow-hidden min-h-full justify-center py-2">
      <motion.div
        ref={carouselRef}
        className="relative shrink-0 h-[clamp(300px,48dvh,360px)] overflow-visible select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onPointerDown={pointerHandlers.onPointerDown}
        onPointerMove={pointerHandlers.onPointerMove}
        onPointerUp={pointerHandlers.onPointerUp}
        onPointerCancel={pointerHandlers.onPointerUp}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <div
          className="absolute top-1/2 left-1/2 flex items-start"
          style={{
            transform: `translateX(${trackX + dragOffset}px) translateY(-50%)`,
            transition:
              dragOffset !== 0
                ? 'none'
                : 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1)',
            width: `${total * SLOT}px`,
          }}
        >
          {items.map((item, i) => {
            const dist = Math.abs(i - current)
            const isActive = i === current
            const scale = isActive ? 1 : dist === 1 ? 0.92 : 0.76
            const opacity = isActive ? 1 : dist === 1 ? 0.85 : 0.45
            const topOffset = isActive ? 0 : dist === 1 ? 12 : 32
            return (
              <div
                key={item.id}
                onClick={() => !isActive && goTo(i)}
                style={{
                  width: `${SLOT}px`,
                  paddingLeft: '5px',
                  paddingRight: '5px',
                  transform: `scale(${scale}) translateY(${topOffset}px)`,
                  opacity,
                  transition:
                    'transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease',
                  transformOrigin: 'top center',
                  cursor: isActive ? 'default' : 'pointer',
                  zIndex: isActive ? 10 : 1,
                  position: 'relative',
                  pointerEvents: 'auto',
                }}
              >
                {isActive && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -10,
                        left: 22,
                        right: 22,
                        height: 28,
                        background: 'rgba(255,255,255,0.55)',
                        borderRadius: 20,
                        zIndex: -1,
                        boxShadow: '0 8px 24px -4px rgba(0,0,0,0.10)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -18,
                        left: 38,
                        right: 38,
                        height: 28,
                        background: 'rgba(255,255,255,0.30)',
                        borderRadius: 20,
                        zIndex: -2,
                        boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)',
                      }}
                    />
                  </>
                )}
                <div
                  className={`bg-white rounded-3xl overflow-hidden ${isActive ? 'shadow-2xl' : 'shadow-none'}`}
                >
                  {renderSlideContent(item, { isActive, index: i })}
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={prev}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isFirst}
          className={cn(
            'absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-[2px] flex items-center justify-center shadow-lg transition-all duration-200 z-20',
            isFirst
              ? 'border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed'
              : 'border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer'
          )}
          aria-label="Previous"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isLast}
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-[2px] flex items-center justify-center shadow-lg transition-all duration-200 z-20',
            isLast
              ? 'border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed'
              : 'border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer'
          )}
          aria-label="Next"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </motion.div>

      {/* Thumbnails */}
      <motion.div
        className="flex justify-center gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => goTo(i)}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 border-[2px]',
              i === current
                ? 'border-km0-yellow-500 scale-110 shadow-md'
                : 'border-km0-beige-200 bg-white opacity-70 hover:opacity-100 hover:scale-105'
            )}
            style={{ background: i === current ? item.color : 'white' }}
            aria-label={`Slide ${i + 1}`}
          >
            {renderThumbnail
              ? renderThumbnail(item, { isActive: i === current, index: i })
              : item.thumb}
          </button>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="flex items-center justify-between px-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <span className="font-ui font-bold text-lg text-primary w-12">
          {current + 1}/{total}
        </span>
        <div className="flex gap-2 items-center">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current
                  ? 'w-4 h-4 bg-km0-yellow-500'
                  : 'w-2.5 h-2.5 bg-km0-blue-200'
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={handleSkip}
          className="bg-primary text-primary-foreground font-ui font-semibold text-sm px-5 py-2.5 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95"
        >
          {buttonLabel}
        </button>
      </motion.div>
    </div>
  )
}

export default StackCarousel
