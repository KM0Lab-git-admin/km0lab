import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Km0Logo from './Km0Logo'
import NotificationBell from './NotificationBell'
import UserGreeting from './UserGreeting'
import skylineMalgrat from '@/assets/skyline-malgrat.png'
import coatMalgrat from '@/assets/coat-malgrat.png'

/**
 * HomeHero — header superior del Home.
 *
 * Estructura: el gradiente beige y el skyline son fondo del propio
 * `<section>`. El contenido (fila header + UserGreeting) se apila
 * en flujo normal con `relative`, así los márgenes/paddings funcionan
 * de verdad entre componentes (sin posiciones absolutas frágiles).
 *
 * En landscape el Hero se vuelve `absolute inset-0` para servir de
 * fondo del body; el contenido interno mantiene `pointer-events-auto`.
 */
export interface HomeHeroProps {
  cityName: string
  hasAlerts: boolean
  onToggleAlerts: () => void
  /** Si se pasa, muestra el botón Back a la izquierda (pantallas interiores: agenda, chat…). */
  onBack?: () => void
  backAriaLabel?: string
  /** Si false, oculta el saludo de usuario (útil en pantallas interiores). */
  showGreeting?: boolean
  /** Si se pasa, sustituye al UserGreeting manteniendo el mismo contenedor (misma altura/fondo). */
  greetingSlot?: ReactNode
}

const HomeHero = ({
  cityName,
  hasAlerts,
  onToggleAlerts,
  onBack,
  backAriaLabel = 'Volver',
  showGreeting = true,
  greetingSlot,
}: HomeHeroProps) => {
  return (
    <motion.section
      className="relative shrink-0 flex flex-col overflow-hidden bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 pb-0 aspect-[1920/716] w-full shadow-[0_10px_28px_-10px_hsl(var(--foreground)/0.22)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Skyline como capa de fondo absoluta del hero, detrás de escudo/nombre/logo */}
      <img
        src={skylineMalgrat}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full object-contain object-top z-0 select-none opacity-25"
      />

      {/* Fila header: escudo + nombre + KM0 + bell */}
      <div className="relative z-10 flex items-center justify-between gap-3 pl-4 pr-5 pt-3 pb-2 vertical-mobile:!pt-4 vertical-mobile:!pb-1">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={backAriaLabel}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-dashed border-km0-yellow-500 text-km0-yellow-600 bg-white/70 hover:bg-km0-yellow-50 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
          )}
          <img
            src={coatMalgrat}
            alt={`Escudo de ${cityName}`}
            className="w-14 h-14 object-contain shrink-0 drop-shadow-[0_2px_4px_hsl(0_0%_100%/0.5)]"
          />
          <div className="flex flex-col items-start justify-center gap-0.5 leading-none min-w-0">
            <h1 className="font-brand font-black text-km0-blue-700 whitespace-nowrap text-left border-0 text-lg">
              {cityName}
            </h1>
            <div className="flex items-center shrink-0">
              <Km0Logo className="h-6 w-auto" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell
            hasAlerts={hasAlerts}
            onClick={onToggleAlerts}
            ariaLabel={
              hasAlerts ? 'Tienes notificaciones nuevas' : 'Sin notificaciones'
            }
            className="shrink-0"
          />
        </div>
      </div>

      {/* Slot inferior: UserGreeting (Home) o contenido custom (pantallas interiores).
          Mantiene SIEMPRE el mismo contenedor para preservar altura y fondo. */}
      {(greetingSlot || showGreeting) && (
        <div className="relative z-10">
          {greetingSlot ?? (
            <UserGreeting name="Albert" points={1259} nextLevel={3000} />
          )}
        </div>
      )}
    </motion.section>
  )
}

export default HomeHero
