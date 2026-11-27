// Espejo del tipo de src/hooks/use-breakpoint.tsx del repo de Lovable.
// No se re-exporta: tokens.ts ya exporta su propio `Breakpoint`.
type Breakpoint =
  | 'vertical-mobile'
  | 'vertical-tablet'
  | 'horizontal-mobile'
  | 'horizontal-desktop'

export type ResponsiveOrientation = 'portrait' | 'landscape'

export type ViewportId =
  | 'mobile-portrait-base'
  | 'mobile-landscape-base'
  | 'tablet-portrait'
  | 'desktop-landscape'

/**
 * Nivel de exigencia de cada viewport:
 *  - `contract`: la pantalla debe verse BIEN aquí (composición, jerarquía,
 *    espaciados). Playwright hace captura de pantalla y compara píxeles.
 *  - `smoke`: la pantalla solo debe NO ROMPERSE aquí (sin overflow lateral,
 *    sin contenido inaccesible). No se optimiza diseño para este viewport
 *    y Playwright solo ejecuta asserts estructurales, sin captura.
 */
export type ViewportTier = 'contract' | 'smoke'

export interface ResponsiveViewport {
  id: ViewportId
  label: string
  width: number
  height: number
  orientation: ResponsiveOrientation
  breakpoint: Breakpoint
  tier: ViewportTier
  purpose: string
}

/**
 * Matriz oficial de viewports para validar maquetación responsive.
 *
 * Son las 4 resoluciones canónicas del monorepo de producción (AGENTS.md
 * de km0lab): un punto por rama CSS (vertical-mobile, vertical-tablet,
 * horizontal-mobile, horizontal-desktop). Cualquier otra resolución cae
 * en una de estas ramas, así que añadir más puntos revisa el mismo CSS
 * dos veces. No añadir viewports sin decisión humana explícita.
 *
 * Mantén esta lista sincronizada con:
 * - `tailwind.config.ts` (variantes vertical/horizontal)
 * - `src/hooks/use-breakpoint.tsx` (detección JS)
 * - `docs/responsive-layout-process.md` (proceso de QA)
 * - `playwright.config.ts` (genera un project por viewport de esta lista)
 */
export const RESPONSIVE_VIEWPORTS: ResponsiveViewport[] = [
  {
    id: 'mobile-portrait-base',
    label: 'Mobile portrait base',
    width: 375,
    height: 667,
    orientation: 'portrait',
    breakpoint: 'vertical-mobile',
    tier: 'contract',
    purpose:
      'Contrato mínimo: toda pantalla debe ser usable sin desbordes laterales.',
  },
  {
    id: 'mobile-landscape-base',
    label: 'Mobile landscape base',
    width: 667,
    height: 375,
    orientation: 'landscape',
    breakpoint: 'horizontal-mobile',
    tier: 'smoke',
    purpose:
      'Solo no-rotura: sin overflow lateral ni contenido inaccesible. No se optimiza diseño para móvil apaisado (decisión de producto, 2026-06).',
  },
  {
    id: 'tablet-portrait',
    label: 'Tablet portrait',
    width: 768,
    height: 1024,
    orientation: 'portrait',
    breakpoint: 'vertical-tablet',
    tier: 'contract',
    purpose:
      'Valida escalado vertical sin convertir tarjetas en bloques demasiado anchos.',
  },
  {
    id: 'desktop-landscape',
    label: 'Desktop landscape',
    width: 1280,
    height: 550,
    orientation: 'landscape',
    breakpoint: 'horizontal-desktop',
    tier: 'contract',
    purpose:
      'Punto canónico horizontal-desktop (alineado con producción): valida columnas y densidad.',
  },
]

// El tsconfig de este monorepo comprueba accesos por índice
// (noUncheckedIndexedAccess); este helper garantiza el tipo no-undefined.
const viewportAt = (index: number): ResponsiveViewport => {
  const viewport = RESPONSIVE_VIEWPORTS[index]
  if (!viewport) {
    throw new Error(`Viewport responsive fuera de rango: ${index}`)
  }
  return viewport
}

export const DEFAULT_VIEWPORT_BY_ORIENTATION: Record<
  ResponsiveOrientation,
  ResponsiveViewport
> = {
  portrait: viewportAt(0),
  landscape: viewportAt(1),
}

/**
 * Vista por nombre camelCase de la misma matriz (consumida por
 * `tokens.ts` y otros sitios donde indexar por id literal es incómodo).
 * Derivada de RESPONSIVE_VIEWPORTS: no duplicar datos aquí.
 */
export const VIEWPORTS = {
  mobilePortraitBase: viewportAt(0),
  mobileLandscape: viewportAt(1),
  tabletPortrait: viewportAt(2),
  desktopLandscape: viewportAt(3),
} as const satisfies Record<string, ResponsiveViewport>

export type ViewportName = keyof typeof VIEWPORTS

export const formatViewportSize = (viewport: ResponsiveViewport): string =>
  `${viewport.width}×${viewport.height}`

/** Viewport de referencia para previews de componentes sueltos (/components). */
export const COMPONENT_PREVIEW_VIEWPORT = VIEWPORTS.mobilePortraitBase

export const getViewportById = (id: ViewportId): ResponsiveViewport => {
  const viewport = RESPONSIVE_VIEWPORTS.find((item) => item.id === id)

  if (!viewport) {
    throw new Error(`Viewport responsive no encontrado: ${id}`)
  }

  return viewport
}

export const getDefaultViewport = (
  orientation: ResponsiveOrientation
): ResponsiveViewport => DEFAULT_VIEWPORT_BY_ORIENTATION[orientation]
