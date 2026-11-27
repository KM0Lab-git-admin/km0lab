import type { HomeModule, HomeModuleId } from '@/components/HomeModules'
import type { TKey } from '@km0lab/app'

/**
 * Módulos iniciales del Home. `labelKey` es la clave de traducción;
 * el `label` real se rellena en runtime con `t(labelKey, lang)`.
 */
export interface HomeModuleSeed extends Omit<HomeModule, 'label'> {
  labelKey: TKey
}

export const INITIAL_MODULES: HomeModuleSeed[] = [
  { id: 'agenda', labelKey: 'module.agenda', active: true },
  { id: 'noticias', labelKey: 'module.noticias', active: true },
  { id: 'comerc', labelKey: 'module.comerc', active: true },
  { id: 'premis', labelKey: 'module.premis', active: true },
  { id: 'chat', labelKey: 'module.chat', active: false },
  { id: 'ajuntament', labelKey: 'module.ajuntament', active: false },
]
