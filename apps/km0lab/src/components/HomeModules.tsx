import agendaIcon from '@/assets/agenda-icon.png'
import chatMascot from '@/assets/chat-mascot.png'
import cityHallIcon from '@/assets/cityhall-icon.png'
import newsIcon from '@/assets/news-icon.png'
import servicesIcon from '@/assets/services-icon.png'
import shopIcon from '@/assets/shop-icon.png'
import { cn } from '@/lib/utils'

/**
 * HomeModules — accesos rápidos de la Home.
 *
 * Banda beige con grid de 6 módulos (2 filas × 3 columnas). Cada módulo
 * es un círculo blanco con icono ilustrado (PNG) y un pill blanco con el
 * label flotando sobre el borde inferior. Todos los módulos tienen el mismo
 * tamaño (sin destacado).
 */

export type HomeModuleId =
  | 'chat'
  | 'agenda'
  | 'ajuntament'
  | 'punts'
  | 'cupons'
  | 'comerc'
  | 'noticias'
  | 'servicios'

export interface HomeModule {
  id: HomeModuleId
  label: string
  active: boolean
  onClick?: () => void
}

const IMAGE_SRC: Partial<Record<HomeModuleId, string>> = {
  chat: chatMascot,
  agenda: agendaIcon,
  ajuntament: cityHallIcon,
  comerc: shopIcon,
  noticias: newsIcon,
  servicios: servicesIcon,
}

/** Padding interno de la imagen dentro del círculo, por id. */
const IMAGE_PADDING: Partial<Record<HomeModuleId, string>> = {
  ajuntament: 'p-2.5 horizontal-mobile:!p-2',
  comerc: 'p-2.5 horizontal-mobile:!p-2',
  noticias: 'p-2.5 horizontal-mobile:!p-2',
  servicios: 'p-2.5 horizontal-mobile:!p-2',
}

interface HomeModulesProps {
  modules: HomeModule[]
  className?: string
}

const HomeModules = ({ modules, className }: HomeModulesProps) => {
  if (modules.length === 0) return null

  return (
    <div className={cn('relative w-full max-w-full', className)}>
      <div
        className={cn(
          'relative bg-km0-beige-100 rounded-3xl px-3 py-2 vertical-tablet:py-3 my-0',
          'horizontal-mobile:!h-[140px] horizontal-desktop:!h-[180px]',
          'horizontal-mobile:!py-1 horizontal-desktop:!py-2'
        )}
      >
        {/* Grid 2 filas × 3 columnas: distribución determinista independiente
            del ancho del label. */}
        <div
          className={cn(
            'relative grid items-center gap-2 vertical-tablet:gap-4',
            'horizontal-mobile:!h-full horizontal-mobile:!items-center',
            'horizontal-mobile:!gap-2 horizontal-desktop:!gap-3'
          )}
          style={{
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
          }}
        >
          {modules.map((mod) => (
            <ModuleItem key={mod.id} module={mod} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Item individual ────────────────────────────────────────── */
interface ModuleItemProps {
  module: HomeModule
}

const ModuleItem = ({ module }: ModuleItemProps) => {
  const { id, active, label, onClick } = module
  const imageSrc = IMAGE_SRC[id]
  const imagePadding = IMAGE_PADDING[id]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      aria-disabled={!active}
      className={cn(
        'group relative flex flex-col items-center justify-self-center w-full min-w-0 min-h-11',
        'transition-transform cursor-pointer active:scale-95',
        'rounded-2xl focus-visible:outline-2 focus-visible:outline-km0-blue-500 focus-visible:outline-offset-2',
        !active && 'opacity-50 grayscale-[0.4] cursor-not-allowed'
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Sombra elíptica bajo el círculo — sensación de flotación */}
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-12 h-1.5 rounded-[50%] bg-km0-blue-900/30 blur-md"
        />

        {/* Círculo blanco con borde fino */}
        <span
          className={cn(
            'relative flex items-center justify-center rounded-full bg-white shrink-0 border-2 border-km0-blue-400',
            'w-[68px] h-[68px]',
            'vertical-tablet:w-[84px] vertical-tablet:h-[84px]',
            'horizontal-mobile:!w-[52px] horizontal-mobile:!h-[52px]'
          )}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt=""
              aria-hidden
              className={cn(
                'w-full h-full object-contain',
                imagePadding,
                !active && 'opacity-70'
              )}
            />
          )}
        </span>

        {/* Pill del label */}
        <span
          className={cn(
            'relative -mt-2.5 horizontal-mobile:!-mt-2 z-10',
            'px-1.5 py-0.5 vertical-tablet:px-2 horizontal-mobile:!px-1',
            'rounded-full bg-white border border-km0-blue-300/60',
            'shadow-[0_2px_6px_-2px_hsl(var(--km0-blue-900)/0.25)]',
            'font-ui font-bold leading-tight text-km0-blue-800',
            'text-[9px] vertical-tablet:text-[11px] horizontal-mobile:!text-[8px]',
            'text-center whitespace-nowrap max-w-full'
          )}
        >
          {label}
        </span>
      </div>
    </button>
  )
}

export default HomeModules
