import { ChevronLeft } from 'lucide-react'

import type { ReactNode } from 'react'

import Km0Logo from '@/components/Km0Logo'
import { cn } from '@/lib/utils'

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
 * En desktop/tablet web se muestra el marco azul “teléfono”. En móvil
 * web y en nativo (Android/iOS) el halo desaparece y la pantalla ocupa
 * el viewport.
 *
 * Las pantallas de chat u otras que necesiten pantalla completa NO
 * usan este componente: tienen su propio layout (FullBleed).
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
  const renderBackButton = (sizeClasses: string, iconSize: number) => {
    if (!onBack) return null
    return (
      <button
        onClick={onBack}
        className={`absolute top-1/2 -translate-y-1/2 ${sizeClasses} flex items-center justify-center rounded-xl border-2 border-dashed border-km0-yellow-500 text-km0-yellow-600 hover:bg-km0-yellow-50 transition-all duration-200 hover:scale-105`}
        aria-label={backAriaLabel}
      >
        <ChevronLeft size={iconSize} strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <div className="device-shell safe-area-inset">
      <div
        data-bp="vertical-mobile portrait"
        className="device-frame device-frame-branded"
      >
        {!hideHeader && (
          <header className="relative shrink-0 flex items-center justify-center pt-5 pb-4 px-16">
            {renderBackButton('left-4 w-10 h-10', 20)}
            <Km0Logo className="h-9 w-auto max-w-full" />
          </header>
        )}

        <div
          className={cn(
            'flex-1 min-h-0 flex flex-col w-full px-4 pb-6 overflow-y-auto overflow-x-hidden',
            hideHeader && 'pt-5',
            portraitContentClassName,
            landscapeContentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default BrandedFrame
