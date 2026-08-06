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
 * `<section>`. La altura la marca el contenido (fila header ± greeting),
 * sin aspect-ratio forzado, para una cabecera compacta y fija.
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
      className="relative shrink-0 flex flex-col overflow-hidden bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 w-full shadow-home-hero"
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
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-2">
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
            className="h-11 w-11 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="flex flex-col items-start justify-center gap-0.5 leading-none min-w-0">
            <h1 className="font-brand font-black text-km0-blue-700 whitespace-nowrap text-left border-0 text-base">
              {cityName}
            </h1>
            <div className="flex items-center shrink-0">
              <Km0Logo className="h-5 w-auto" />
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
