import { useAppStore } from '@km0lab/app'
import { type ReactNode } from 'react'

import type { Lang } from '@km0lab/app'

/**
 * LangContext — Compatibilidad: el idioma global vive ahora en
 * `useAppStore` (Zustand + persist). Mantenemos `LangProvider` como
 * passthrough y `useLang` con la misma firma para no tocar pantallas.
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
  const setLang = useAppStore((s) => s.setLang)
  return { lang, setLang }
}
