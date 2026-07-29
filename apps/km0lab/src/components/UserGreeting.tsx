import { Star } from 'lucide-react'
import handStarIcon from '@/assets/icon-hand-star.png'
import giftIcon from '@/assets/icon-gift.png'

/**
 * UserGreeting — saludo del usuario autenticado con puntos y progreso
 * al siguiente nivel. Se renderiza en lugar del CTA "Iniciar sesión"
 * cuando hay sesión activa.
 *
 * Maquetación pura: aún no consume `useAuth`. El consumidor pasa
 * `name`, `points` y `nextLevel` (umbral del siguiente hito).
 * Si `name` no está definido, solo muestra "Hola".
 */
export interface UserGreetingProps {
  name?: string | null
  points: number
  nextLevel: number
  className?: string
}

const UserGreeting = ({
  name,
  points,
  nextLevel,
  className = '',
}: UserGreetingProps) => {
  const safePoints = Math.max(0, points)
  const safeNext = Math.max(safePoints + 1, nextLevel)
  const pct = Math.min(100, Math.round((safePoints / safeNext) * 100))

  return (
    <div className={`w-full flex items-center gap-2 my-0 ${className}`.trim()}>
      {/* Bloque 1: avatar + saludo + puntos */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Avatar placeholder (luego: badge real del usuario) */}
        <div
          aria-hidden
          className="shrink-0 w-10 h-10 rounded-full bg-km0-beige-50 border-2 border-km0-blue-700/15 shadow-sm flex items-center justify-center overflow-hidden"
        >
          <img
            src={handStarIcon}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col leading-tight min-w-0">
          <p className="font-brand font-black text-km0-blue-700 text-sm whitespace-nowrap truncate">
            Hola{name ? ` ${name}` : ''}!
          </p>
          <div className="flex items-center gap-1">
            <Star
              className="w-3.5 h-3.5 text-km0-coral-400 fill-km0-coral-400"
              strokeWidth={2}
            />
            <span className="font-ui text-xs text-km0-blue-800">
              {safePoints.toLocaleString('es-ES')} punts
            </span>
          </div>
        </div>
      </div>

      {/* Bloque 2: icono regalo (hijo directo) */}
      <img
        src={giftIcon}
        alt="Próximo regalo"
        className="ml-auto shrink-0 w-10 h-10 object-contain"
      />

      {/* Bloque 3: tarjeta puntos + barra */}
      <div className="shrink-0 min-w-[125px] rounded-xl bg-km0-beige-100 border border-km0-blue-700/10 px-2.5 py-1.5 text-right">
        <p className="font-body text-km0-blue-800 text-[11px] whitespace-nowrap leading-tight">
          {safePoints.toLocaleString('es-ES')}/
          {safeNext.toLocaleString('es-ES')} p
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={safeNext}
          aria-valuenow={safePoints}
          className="mt-1 h-1.5 w-full rounded-full bg-km0-beige-200 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-km0-teal-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default UserGreeting
