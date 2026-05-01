import { Text } from '@km0lab/ui'
import { cn } from '@km0lab/ui/lib/utils'
import { Platform, Pressable, View } from 'react-native'

import { Km0Logo } from './Km0Logo'

import type { ReactNode } from 'react'

/**
 * BrandedFrame — Wrapper compartido para pantallas "con marca".
 *
 * En **web** mantiene un frame fijo de ratio 9:19.5 (portrait) o 16:9
 * (landscape) calculado desde el viewport con CSS `min()`/`100dvh`.
 * Garantiza que el logo y la card queden en la misma posición y
 * tamaño en los cuatro breakpoints oficiales del proyecto:
 *
 *   vertical-mobile     (≤767  portrait)   → 375×667
 *   vertical-tablet     (≥768  portrait)   → 768×1024
 *   horizontal-mobile   (≤1279 landscape)  → 667×375
 *   horizontal-desktop  (≥1280 landscape)  → 1280×550
 *
 * En **nativo** (iOS/Android) la app ya ocupa la pantalla completa del
 * dispositivo, así que el frame se renderiza full-bleed sin las
 * dimensiones calculadas (CSS `100dvh`/`calc()` no existen en RN
 * nativo). El header con logo y back button se mantiene idéntico.
 *
 * Las pantallas tipo Chat que necesitan fullbleed en web también NO
 * usan este componente, tienen su propio layout.
 *
 * Las dimensiones del frame en web usan `style={{...}}` con cálculos
 * CSS porque dependen del viewport en runtime. El AGENTS.md sección 4
 * permite `style={...}` para valores dinámicos calculados.
 */
type BrandedFrameProps = {
  children: ReactNode
  onBack?: () => void
  /** Aria label para el back button. La copy es responsabilidad de la pantalla. */
  backAriaLabel?: string
  /** Clases extra para el contenedor del body en portrait. */
  portraitContentClassName?: string
  /** Clases extra para el contenedor del body en landscape. */
  landscapeContentClassName?: string
}

/* CSS dinámico solo aplicable en web (100dvh, calc, min son CSS funcs). */
const PORTRAIT_FRAME_WEB_STYLE =
  Platform.OS === 'web'
    ? {
        width:
          'min(calc(100vw - 1.5rem), calc((100dvh - 1.5rem) * 9 / 19.5), 420px)',
        height:
          'min(calc(100dvh - 1.5rem), calc((100vw - 1.5rem) * 19.5 / 9), calc(420px * 19.5 / 9))',
      }
    : undefined

const LANDSCAPE_FRAME_WEB_STYLE =
  Platform.OS === 'web'
    ? {
        width:
          'min(calc(100vw - 2rem), calc((100dvh - 2rem) * 16 / 9), 1200px)',
        height:
          'min(calc(100dvh - 2rem), calc((100vw - 2rem) * 9 / 16), calc(1200px * 9 / 16))',
      }
    : undefined

export function BrandedFrame({
  children,
  onBack,
  backAriaLabel = 'Back',
  portraitContentClassName,
  landscapeContentClassName,
}: BrandedFrameProps) {
  return (
    <View className="min-h-screen w-full flex-1 items-center justify-center bg-background web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 vertical-mobile:p-3 vertical-tablet:p-4 horizontal-mobile:p-3 horizontal-desktop:p-4">
      {/* ── PORTRAIT (vertical-mobile + vertical-tablet) ─────── */}
      <View
        className={cn(
          'flex-col overflow-hidden rounded-3xl border-2 border-km0-blue-700/80 bg-background',
          'web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 web:shadow-km0-landscape',
          'native:flex-1 native:w-full',
          'horizontal-mobile:hidden horizontal-desktop:hidden'
        )}
        style={PORTRAIT_FRAME_WEB_STYLE}
      >
        {/* Header — logo centrado con padding lateral reservado para
            que el back button nunca se solape (incluso a 375px). */}
        <View className="relative shrink-0 flex-row items-center justify-center px-16 pb-4 pt-5">
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backAriaLabel}
              onPress={onBack}
              className={cn(
                'absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 items-center justify-center',
                'rounded-xl border-2 border-dashed border-km0-yellow-500 bg-km0-beige-50',
                'web:transition-all web:duration-200 web:hover:scale-105'
              )}
            >
              <Text className="text-xl text-km0-yellow-600">‹</Text>
            </Pressable>
          ) : null}
          <Km0Logo width={144} height={28} />
        </View>

        {/* Body — scroll interno en web si desborda; el frame nunca se mueve. */}
        <View
          className={cn(
            'min-h-0 w-full flex-1 flex-col px-4 pb-6 web:overflow-y-auto',
            portraitContentClassName
          )}
        >
          {children}
        </View>
      </View>

      {/* ── LANDSCAPE (horizontal-mobile + horizontal-desktop) ─ */}
      <View
        className={cn(
          'hidden flex-col overflow-hidden rounded-3xl border-2 border-km0-blue-700/80 bg-background',
          'web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 web:shadow-km0-landscape',
          'native:flex-1 native:w-full',
          'horizontal-mobile:flex horizontal-desktop:flex'
        )}
        style={LANDSCAPE_FRAME_WEB_STYLE}
      >
        {/* Header */}
        <View className="relative shrink-0 flex-row items-center justify-center px-5 pb-2 pt-3 horizontal-desktop:pb-4 horizontal-desktop:pt-5">
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backAriaLabel}
              onPress={onBack}
              className={cn(
                'absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 items-center justify-center horizontal-desktop:left-4',
                'rounded-xl border-2 border-dashed border-km0-yellow-500 bg-km0-beige-50',
                'web:transition-all web:duration-200 web:hover:scale-105'
              )}
            >
              <Text className="text-xl text-km0-yellow-600">‹</Text>
            </Pressable>
          ) : null}
          <Km0Logo width={128} height={24} />
        </View>

        {/* Body */}
        <View
          className={cn(
            'min-h-0 w-full flex-1 overflow-hidden px-4 pb-3 horizontal-desktop:px-6 horizontal-desktop:pb-6',
            landscapeContentClassName
          )}
        >
          {children}
        </View>
      </View>
    </View>
  )
}
