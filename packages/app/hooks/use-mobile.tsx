import { useBreakpoint } from './use-breakpoint'

/**
 * @deprecated Usa `useBreakpoint()` de `@/hooks/use-breakpoint`.
 *
 * Devuelve `true` cuando el viewport es móvil en cualquier orientación
 * (vertical-mobile o horizontal-mobile).
 *
 * Mantenido por compatibilidad con componentes shadcn/ui que lo importan.
 */
export function useIsMobile(): boolean {
  const bp = useBreakpoint()
  return bp === 'vertical-mobile' || bp === 'horizontal-mobile'
}
