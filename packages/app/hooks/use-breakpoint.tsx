import * as React from 'react'

/**
 * Breakpoints oficiales del proyecto, alineados 1:1 con producción y Playwright.
 *
 *  vertical-mobile     → portrait + width ≤ 767   (canónica 375 × 667)
 *  vertical-tablet     → portrait + width ≥ 768   (canónica 768 × 1024)
 *  horizontal-mobile   → landscape + width ≤ 1279 (canónica 667 × 375)
 *  horizontal-desktop  → landscape + width ≥ 1280 (canónica 1280 × 720)
 *
 * Estos nombres y umbrales deben coincidir con las variantes definidas en
 * `tailwind.config.ts` (plugins → addVariant). NO modificar de forma aislada.
 */
export type Breakpoint =
  | 'vertical-mobile'
  | 'vertical-tablet'
  | 'horizontal-mobile'
  | 'horizontal-desktop'

const QUERIES: Record<Breakpoint, string> = {
  'vertical-mobile': '(orientation: portrait)  and (max-width: 767px)',
  'vertical-tablet': '(orientation: portrait)  and (min-width: 768px)',
  'horizontal-mobile': '(orientation: landscape) and (max-width: 1279px)',
  'horizontal-desktop': '(orientation: landscape) and (min-width: 1280px)',
}

function detect(): Breakpoint {
  if (typeof window === 'undefined') return 'vertical-mobile'
  for (const key of Object.keys(QUERIES) as Breakpoint[]) {
    if (window.matchMedia(QUERIES[key]).matches) return key
  }
  return 'vertical-mobile'
}

/**
 * Contexto opcional para FORZAR un breakpoint en un subárbol concreto.
 * Si no hay provider, useBreakpoint() funciona como siempre: lee el
 * viewport real con matchMedia.
 */
const BreakpointContext = React.createContext<Breakpoint | null>(null)

export const BreakpointProvider = ({
  value,
  children,
}: {
  value: Breakpoint
  children: React.ReactNode
}) => (
  <BreakpointContext.Provider value={value}>
    {children}
  </BreakpointContext.Provider>
)

/**
 * Devuelve el breakpoint activo. Reactivo a cambios de tamaño/orientación.
 * Si hay un BreakpointProvider antecesor, devuelve ese valor forzado.
 *
 * @example
 *   const bp = useBreakpoint();
 *   if (bp === "horizontal-desktop") { ... }
 */
export function useBreakpoint(): Breakpoint {
  const forced = React.useContext(BreakpointContext)
  const [bp, setBp] = React.useState<Breakpoint>(() => detect())

  React.useEffect(() => {
    if (forced) return // No suscribimos si estamos en modo forzado.
    const mqls = (Object.keys(QUERIES) as Breakpoint[]).map((key) => ({
      key,
      mql: window.matchMedia(QUERIES[key]),
    }))
    const onChange = () => setBp(detect())
    mqls.forEach(({ mql }) => mql.addEventListener('change', onChange))
    setBp(detect())
    return () => {
      mqls.forEach(({ mql }) => mql.removeEventListener('change', onChange))
    }
  }, [forced])

  return forced ?? bp
}

/** Helpers booleanos para casos puntuales. */
export const useIsVerticalMobile = () => useBreakpoint() === 'vertical-mobile'
export const useIsVerticalTablet = () => useBreakpoint() === 'vertical-tablet'
export const useIsHorizontalMobile = () =>
  useBreakpoint() === 'horizontal-mobile'
export const useIsHorizontalDesktop = () =>
  useBreakpoint() === 'horizontal-desktop'
