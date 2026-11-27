import { t } from '@km0lab/app'
import { Button } from '@km0lab/ui'

import agenda from '@/assets/burbuja/module-agenda.webp.asset.json'
import townHall from '@/assets/burbuja/module-ayuntamiento.webp.asset.json'
import chat from '@/assets/burbuja/module-chat.webp.asset.json'
import shops from '@/assets/burbuja/module-comercios.webp.asset.json'
import news from '@/assets/burbuja/module-noticias.webp.asset.json'
import rewards from '@/assets/burbuja/module-premios.webp.asset.json'
import { useLang } from '@/contexts/LangContext'
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
  | 'premis'

export interface HomeModule {
  id: HomeModuleId
  label: string
  active: boolean
  disabledReason?: 'coming_soon' | 'requires_registration'
  onClick?: () => void
}

const IMAGE_SRC: Partial<Record<HomeModuleId, string>> = {
  chat: chat.url,
  agenda: agenda.url,
  ajuntament: townHall.url,
  comerc: shops.url,
  noticias: news.url,
  servicios: shops.url,
  premis: rewards.url,
}
const BACKGROUNDS: Partial<Record<HomeModuleId, string>> = {
  agenda: 'bg-km0-teal-100',
  noticias: 'bg-km0-blue-100',
  comerc: 'bg-km0-yellow-100',
  premis: 'bg-km0-coral-50',
}
interface HomeModulesProps {
  modules: HomeModule[]
  className?: string
}
const HomeModules = ({ modules, className }: HomeModulesProps) => {
  const { lang } = useLang()
  return (
    <div
      className={cn(
        'grid grid-cols-3 items-start gap-x-1 gap-y-5 pt-2',
        className
      )}
    >
      {modules.map((mod) => (
        <Button
          key={mod.id}
          variant="bubbleSurface"
          onClick={mod.onClick}
          disabled={!mod.active}
          className="relative h-auto min-h-11 w-full flex-col gap-2 whitespace-normal rounded-2xl p-0"
        >
          <span
            className={cn(
              'flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full shadow-[var(--shadow-bubble)]',
              mod.active
                ? (BACKGROUNDS[mod.id] ?? 'bg-km0-blue-100')
                : 'bg-km0-blue-50'
            )}
          >
            <img
              src={IMAGE_SRC[mod.id]}
              alt=""
              className={cn(
                'h-[58px] w-[58px] object-contain',
                !mod.active && 'grayscale opacity-60'
              )}
            />
          </span>
          {!mod.active && (
            <span className="absolute -top-2 rounded-full bg-km0-coral-400 px-2 py-1 font-ui text-[11px] font-bold leading-tight text-destructive-foreground">
              {t(
                mod.disabledReason === 'requires_registration'
                  ? 'module.register_to_enable'
                  : 'module.coming_soon',
                lang
              )}
            </span>
          )}
          <span className="min-h-8 text-center font-ui text-xs font-bold leading-tight text-km0-blue-800">
            {mod.label}
          </span>
        </Button>
      ))}
    </div>
  )
}
export default HomeModules
