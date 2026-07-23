import { ChevronLeft } from 'lucide-react'

import type { ReactNode } from 'react'

import Km0Logo from '@/components/Km0Logo'

/**
 * BrandedFrame — Envoltorio compartido para pantallas "con marca".
 *
 * Garantiza que en TODAS las pantallas de esta familia (Language,
 * Onboarding, PostalCode…) el logo KM0 LAB y la card floating queden
 * EXACTAMENTE en la misma posición y tamaño, en cada uno de los cuatro
 * breakpoints oficiales del proyecto:
 *
 *   vertical-mobile     (≤767  portrait)   → 375×667
 *   vertical-tablet     (≥768  portrait)   → 768×1024
 *   horizontal-mobile   (≤1279 landscape)  → 667×375
 *   horizontal-desktop  (≥1280 landscape)  → 1280×550
 *
 * Las pantallas de chat u otras que necesiten pantalla completa NO
 * usan este componente: tienen su propio layout (FullBleed).
 *
 * Props:
 *   - onBack:  si se pasa, dibuja el botón back amarillo a la izquierda
 *              del logo (el logo se mantiene perfectamente centrado).
 *   - children: contenido de la pantalla. Se renderiza dentro de un
 *              flex-col que ocupa todo el espacio restante bajo el header.
 *   - portraitContentClassName / landscapeContentClassName:
 *              clases extra para ajustar el contenido por orientación.
 *
 * IMPORTANTE: usa SIEMPRE las variantes oficiales (vertical-mobile,
 * vertical-tablet, horizontal-mobile, horizontal-desktop). Los aliases
 * (short-landscape, wide-landscape, tablet-portrait) están deprecados.
 */
interface BrandedFrameProps {
  children: ReactNode
  onBack?: () => void
  /** Aria label para el back button (i18n responsabilidad de la pantalla) */
  backAriaLabel?: string
  /** Si true, oculta el header con el logo (útil cuando la pantalla ya tiene su propio hero) */
  hideHeader?: boolean
  /** Clases extra para el contenedor de contenido en portrait */
  portraitContentClassName?: string
  /** Clases extra para el contenedor de contenido en landscape */
  landscapeContentClassName?: string
}

const BrandedFrame = ({
  children,
  onBack,
  backAriaLabel = 'Back',
  hideHeader = false,
  portraitContentClassName = '',
  landscapeContentClassName = '',
}: BrandedFrameProps) => {
  // Botón back reutilizado en ambas orientaciones (tamaño distinto).
  const renderBackButton = (sizeClasses: string, iconSize: number) => {
    if (!onBack) return null
    return (
      <button
        onClick={onBack}
        className={`absolute top-1/2 -translate-y-1/2 ${sizeClasses} flex items-center justify-center rounded-xl border-[2px] border-dashed border-km0-yellow-500 text-km0-yellow-600 hover:bg-km0-yellow-50 transition-all duration-200 hover:scale-105`}
        aria-label={backAriaLabel}
      >
        <ChevronLeft size={iconSize} strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-km0-beige-50 to-km0-beige-100"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* ── PORTRAIT (vertical-mobile + vertical-tablet) ─────── */}
      <div
        className="landscape:hidden flex flex-col bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 rounded-3xl border-2 border-km0-blue-700/80 shadow-[0_24px_60px_-20px_hsl(var(--km0-blue-700)/0.3)] overflow-hidden"
        style={{
          width: 'min(100vw, 420px)',
          height:
            'min(100dvh, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)))',
        }}
      >
        {/* Header — logo centrado con espacio reservado a los lados
            para que NUNCA se solape con el back button (incluso a 375px). */}
        {!hideHeader && (
          <header className="relative shrink-0 flex items-center justify-center pt-5 pb-4 px-16">
            {renderBackButton('left-4 w-10 h-10', 20)}
            <Km0Logo className="h-9 w-auto max-w-full" />
          </header>
        )}

        {/* Body — scroll interno si desborda, frame nunca se mueve */}
        <div
          className={`flex-1 min-h-0 flex flex-col w-full px-4 pb-6 overflow-y-auto overflow-x-hidden ${hideHeader ? 'pt-5' : ''} ${portraitContentClassName}`}
        >
          {children}
        </div>
      </div>

      {/* ── LANDSCAPE (horizontal-mobile + horizontal-desktop) ─ */}
      {/*
        Card de tamaño FIJO ratio 16:9. Mismas reglas: tamaño calculado
        solo desde el viewport, nunca desde el contenido.
      */}
      <div
        className="hidden landscape:flex bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 rounded-3xl border-2 border-km0-blue-700/80 shadow-[0_24px_60px_-20px_hsl(var(--km0-blue-700)/0.3)] overflow-hidden flex-col"
        style={{
          width: 'min(100vw, calc(100dvh * 16 / 9), 1700px)',
          height: 'min(100dvh, calc(100vw * 9 / 16), calc(1700px * 9 / 16))',
        }}
      >
        {/* Header */}
        {!hideHeader && (
          <header className="relative shrink-0 flex items-center justify-center pt-3 horizontal-desktop:pt-5 pb-2 horizontal-desktop:pb-4 px-5">
            {renderBackButton('left-3 horizontal-desktop:left-4 w-9 h-9', 20)}
            <Km0Logo className="h-8 horizontal-desktop:h-11 w-auto" />
          </header>
        )}

        {/* Body */}
        <div
          className={`flex-1 min-h-0 flex w-full px-4 horizontal-desktop:px-6 pb-3 horizontal-desktop:pb-6 overflow-hidden ${hideHeader ? 'pt-3 horizontal-desktop:pt-5' : ''} ${landscapeContentClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default BrandedFrame
