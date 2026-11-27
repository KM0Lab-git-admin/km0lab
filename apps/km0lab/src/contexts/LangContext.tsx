import { useAppStore } from '@km0lab/app'
import { type ReactNode } from 'react'

import type { Lang } from '@km0lab/app'

/**
 * LangContext — Compatibilidad: el idioma global vive ahora en
 * `useAppStore` (Zustand + persist). Mantenemos `LangProvider` como
 * passthrough y `useLang` con la misma firma para no tocar pantallas.
 *
 * Propiedad de producción (`locked` en scripts/lovable-manifest.json): es el
 * único punto por el que las pantallas de Lovable cambian el idioma, así que
 * aquí se traduce a `chooseLang`, que además marca la elección explícita
 * (`langChosen`) que exige `RequireSetup`. El `setLang` crudo del store queda
 * para los cambios que no vienen del usuario (p. ej. el idioma que devuelve
 * la API al iniciar sesión, en services/auth).
 */
interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

export const LangProvider = ({ children }: { children: ReactNode }) => (
  <>{children}</>
)

export const useLang = (): LangContextValue => {
  const lang = useAppStore((s) => s.lang)
  const chooseLang = useAppStore((s) => s.chooseLang)
  return { lang, setLang: chooseLang }
}
