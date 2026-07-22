import confetti from 'canvas-confetti'
import { useEffect, useRef, useState } from 'react'

import starIcon from '@/assets/icon-star-rewards.png'

/**
 * PointsRewardOverlay — overlay de recompensa de puntos al estilo Glovo.
 *
 * Disparadores típicos:
 *   - Registro:  +500 pts · "¡Bienvenido!"
 *   - Pedido:    +50 pts  · "Pedido completado"
 *   - Reto:      +200 pts · "¡Reto completado!"
 *
 * Colores mapeados a tokens KM0. Para canvas-confetti se mantienen los hex
 * equivalentes a las CSS vars (sincronizar si cambian en index.css):
 *   navy   #174094  → km0-blue-700
 *   yellow #F5C542  → km0-yellow-500
 *   coral  #FF664D  → km0-coral-400
 *
 * Modo `contained`: el overlay Y el confeti se anclan al contenedor `relative`
 * padre en vez de ocupar toda la ventana. Útil para previews / sandboxes.
 */
export interface PointsRewardOverlayProps {
  points: number
  message?: string
  onClose: () => void
  contained?: boolean
}

const CONFETTI_COLORS = ['#174094', '#F5C542', '#FF664D', '#FFFFFF']

const PointsRewardOverlay = ({
  points,
  message = '¡Bienvenido!',
  onClose,
  contained = false,
}: PointsRewardOverlayProps) => {
  const [displayPoints, setDisplayPoints] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Confeti multi-burst + contador animado 0 → points (easeOutCubic, 1.2s).
  useEffect(() => {
    // En modo contained usamos un canvas propio dentro del overlay para que
    // las partículas no escapen del contenedor del sandbox.
    let fire: (ratio: number, opts: confetti.Options) => void
    let instance: confetti.CreateTypes | null = null

    if (contained && canvasRef.current) {
      instance = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: false,
      })
      fire = (ratio, opts) =>
        instance!({
          origin: { y: 0.55 },
          particleCount: Math.floor(220 * ratio),
          colors: CONFETTI_COLORS,
          ...opts,
        })
    } else {
      fire = (ratio, opts) =>
        confetti({
          origin: { y: 0.55 },
          particleCount: Math.floor(220 * ratio),
          colors: CONFETTI_COLORS,
          ...opts,
        })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })

    const duration = 1200
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayPoints(Math.round(eased * points))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      instance?.reset()
    }
  }, [points, contained])

  // Cierre por tecla Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const positionClass = contained ? 'absolute inset-0' : 'fixed inset-0'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={message}
      onClick={onClose}
      className={`${positionClass} z-50 flex items-center justify-center overflow-hidden animate-fade-in-overlay bg-km0-blue-700/55 backdrop-blur-sm`}
    >
      {contained && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex flex-col items-center px-6 py-6 rounded-3xl bg-card shadow-2xl animate-pop-in max-w-[90%]"
      >
        <div className="relative mb-4 h-36 w-36">
          {/* Sparkles decorativos */}
          <span
            className="absolute top-2 left-2 h-3 w-3 rounded-full bg-km0-coral-400 animate-sparkle"
            style={{ animationDelay: '0s' }}
          />
          <span
            className="absolute top-4 right-4 h-2 w-2 rounded-full bg-km0-yellow-500 animate-sparkle"
            style={{ animationDelay: '0.3s' }}
          />
          <span
            className="absolute bottom-6 left-6 h-2.5 w-2.5 rounded-full bg-km0-blue-700 animate-sparkle"
            style={{ animationDelay: '0.6s' }}
          />
          <span
            className="absolute bottom-2 right-8 h-3 w-3 rounded-full bg-km0-coral-400 animate-sparkle"
            style={{ animationDelay: '0.9s' }}
          />

          {/* Estrella central */}
          <div className="absolute inset-0 flex items-center justify-center animate-wiggle">
            <img
              src={starIcon}
              alt=""
              aria-hidden
              className="h-32 w-32 object-contain drop-shadow-lg"
            />
          </div>

          {/* Badge flotante +points */}
          <div className="absolute -top-2 -right-2 rounded-full px-3 py-1 font-ui text-base text-white bg-km0-coral-400 shadow-[0_8px_20px_-4px_hsl(var(--km0-coral-400)/0.6)] animate-float-up">
            +{points}
          </div>
        </div>

        <p className="mb-1 font-body text-sm text-km0-blue-700/70">{message}</p>

        <div className="flex items-baseline gap-2">
          <span className="font-brand text-5xl tabular-nums text-km0-blue-700">
            {displayPoints}
          </span>
          <span className="font-ui text-lg text-km0-coral-400">pts</span>
        </div>

        <p className="mt-2 font-ui text-sm text-km0-blue-700">
          ¡Has ganado puntos!
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-full px-7 py-2.5 font-ui text-sm text-white bg-km0-blue-700 hover:bg-km0-blue-600 active:scale-95 transition-all"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  )
}

export default PointsRewardOverlay
