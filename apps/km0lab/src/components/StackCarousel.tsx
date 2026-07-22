import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

/**
 * StackCarousel — carrusel reutilizable con efecto "stack" (pila 3D):
 * la slide central está en primer plano, las laterales encogidas y
 * desplazadas hacia abajo (portrait) o sólo escaladas (landscape).
 *
 * Soporta:
 *  - drag/swipe con pointer events
 *  - flechas prev/next
 *  - thumbnails y dots
 *  - layout portrait + landscape con sus tamaños propios
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
const getSlotLs = () => {
  if (typeof window === 'undefined') return 420
  const w = window.innerWidth
  if (w >= 1280) return 560 // horizontal-desktop
  return 360 // horizontal-mobile
}

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
  const [portraitScale, setPortraitScale] = useState(1)
  const [slotLs, setSlotLs] = useState(420)
  const touchStartX = useRef<number | null>(null)
  const touchStartXLs = useRef<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const carouselRefLs = useRef<HTMLDivElement>(null)

  const measure = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches
      const isSm = window.matchMedia('(min-width: 640px)').matches
      setPortraitScale(isPortrait && isSm ? 1.35 : 1)
      setSlotLs(getSlotLs())
    }
  }, [])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

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

  const makePointerHandlers = (
    refStart: React.MutableRefObject<number | null>
  ) => ({
    onPointerDown: (e: React.PointerEvent) => {
      refStart.current = e.clientX
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (refStart.current === null) return
      setDragOffset(e.clientX - refStart.current)
    },
    onPointerUp: (e: React.PointerEvent) => {
      const el = e.currentTarget as HTMLElement
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId)
      if (refStart.current === null) return
      const delta = refStart.current - e.clientX
      refStart.current = null
      setDragOffset(0)
      if (Math.abs(delta) > 40) {
        if (delta > 0) next()
        else prev()
      }
    },
  })

  const portraitHandlers = makePointerHandlers(touchStartX)
  const landscapeHandlers = makePointerHandlers(touchStartXLs)

  const trackX = -(current * SLOT + SLOT / 2)
  const trackXLs = -(current * slotLs + slotLs / 2)

  const handleSkip = () => {
    onFinish?.()
  }

  const buttonLabel = isLast ? finishLabel : skipLabel

  return (
    <>
      {/* ── PORTRAIT ───────────────────────────────────────── */}
      <div className="w-full max-w-[390px] sm:max-w-[460px] mx-auto flex flex-col gap-3 sm:gap-5 overflow-hidden landscape:hidden flex-1 min-h-0 py-2 sm:py-4">
        <motion.div
          ref={carouselRef}
          className="relative flex-1 min-h-[240px] sm:min-h-[440px] overflow-visible select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={portraitHandlers.onPointerDown}
          onPointerMove={portraitHandlers.onPointerMove}
          onPointerUp={portraitHandlers.onPointerUp}
          onPointerCancel={portraitHandlers.onPointerUp}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `scale(${portraitScale})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 flex items-start"
              style={{
                transform: `translateX(${trackX + dragOffset / portraitScale}px) translateY(-50%)`,
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

      {/* ── LANDSCAPE ──────────────────────────────────────── */}
      <div className="hidden landscape:flex w-full flex-1 min-h-0 flex-col relative">
        <motion.div
          ref={carouselRefLs}
          className="relative flex-1 min-h-0 overflow-visible select-none cursor-grab active:cursor-grabbing px-12 horizontal-mobile:px-10"
          style={{ touchAction: 'none' }}
          onPointerDown={landscapeHandlers.onPointerDown}
          onPointerMove={landscapeHandlers.onPointerMove}
          onPointerUp={landscapeHandlers.onPointerUp}
          onPointerCancel={landscapeHandlers.onPointerUp}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2">
            <div
              className="flex items-start"
              style={{
                transform: `translateX(${trackXLs + dragOffset}px)`,
                transition:
                  dragOffset !== 0
                    ? 'none'
                    : 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1)',
                width: `${total * slotLs}px`,
              }}
            >
              {items.map((item, i) => {
                const dist = Math.abs(i - current)
                const isActive = i === current
                const scale = isActive ? 1 : dist === 1 ? 0.88 : 0.74
                const opacity = isActive ? 1 : dist === 1 ? 0.85 : 0.45
                return (
                  <div
                    key={item.id}
                    onClick={() => !isActive && goTo(i)}
                    style={{
                      width: `${slotLs}px`,
                      paddingLeft: '10px',
                      paddingRight: '10px',
                      transform: `scale(${scale})`,
                      opacity,
                      transition:
                        'transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease',
                      transformOrigin: 'center center',
                      cursor: isActive ? 'default' : 'pointer',
                      zIndex: isActive ? 10 : 1,
                      position: 'relative',
                    }}
                  >
                    {isActive && (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -10,
                            left: 32,
                            right: 32,
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
                            left: 52,
                            right: 52,
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
          </div>

          <button
            onClick={prev}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isFirst}
            className={cn(
              'absolute left-2 short-landscape:left-1 top-1/2 -translate-y-1/2 w-11 h-11 short-landscape:w-9 short-landscape:h-9 rounded-full bg-white border-[2px] flex items-center justify-center shadow-xl transition-all duration-200 z-30',
              isFirst
                ? 'border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed'
                : 'border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer'
            )}
            aria-label="Previous"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isLast}
            className={cn(
              'absolute right-2 short-landscape:right-1 top-1/2 -translate-y-1/2 w-11 h-11 short-landscape:w-9 short-landscape:h-9 rounded-full bg-white border-[2px] flex items-center justify-center shadow-xl transition-all duration-200 z-30',
              isLast
                ? 'border-km0-beige-200 text-km0-beige-300 opacity-40 cursor-not-allowed'
                : 'border-km0-yellow-400 text-km0-blue-700 hover:bg-km0-yellow-50 hover:scale-110 cursor-pointer'
            )}
            aria-label="Next"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </motion.div>

        <footer className="shrink-0 border-t border-km0-beige-200/70 bg-white/40 backdrop-blur-sm px-4 py-2 wide-landscape:px-5 wide-landscape:py-2.5 short-landscape:px-3 short-landscape:py-1.5 flex items-center justify-between gap-3 wide-landscape:gap-4 short-landscape:gap-2">
          <div className="flex items-center gap-2 wide-landscape:gap-3 short-landscape:gap-2 shrink-0">
            <span className="font-ui font-bold text-sm wide-landscape:text-sm short-landscape:text-xs text-primary">
              {current + 1}/{total}
            </span>
            <div className="flex gap-1.5 wide-landscape:gap-1.5 short-landscape:gap-1">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => goTo(i)}
                  className={cn(
                    'w-8 h-8 wide-landscape:w-8 wide-landscape:h-8 short-landscape:w-6 short-landscape:h-6 rounded-lg flex items-center justify-center text-base wide-landscape:text-base short-landscape:text-xs transition-all duration-200 border-[2px]',
                    i === current
                      ? 'border-km0-yellow-500 shadow-md scale-105'
                      : 'border-km0-beige-200 bg-white opacity-70 hover:opacity-100'
                  )}
                  style={{ background: i === current ? item.color : 'white' }}
                  aria-label={`Slide ${i + 1}`}
                >
                  {renderThumbnail
                    ? renderThumbnail(item, {
                        isActive: i === current,
                        index: i,
                      })
                    : item.thumb}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center gap-2 items-center">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === current
                    ? 'w-3 h-3 wide-landscape:w-3.5 wide-landscape:h-3.5 bg-km0-yellow-500'
                    : 'w-2 h-2 wide-landscape:w-2.5 wide-landscape:h-2.5 bg-km0-blue-200'
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="shrink-0 bg-primary text-primary-foreground font-ui font-semibold text-sm wide-landscape:text-sm short-landscape:text-xs px-4 wide-landscape:px-5 short-landscape:px-4 py-2 short-landscape:py-2 rounded-2xl hover:bg-km0-blue-600 hover:scale-[1.03] transition-all duration-200 active:scale-95"
          >
            {buttonLabel}
          </button>
        </footer>
      </div>
    </>
  )
}

export default StackCarousel
