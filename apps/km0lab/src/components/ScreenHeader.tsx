import { Button } from '@km0lab/ui'
import { ChevronLeft } from 'lucide-react'

import type { ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  subtitle?: string | readonly [string] | readonly [string, string]
  onBack: () => void
  backAriaLabel: string
  actions?: ReactNode
}

/** Pure presentation: the screen supplies navigation, localized text and actions. */
const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  backAriaLabel,
  actions,
}: ScreenHeaderProps) => {
  const lines = typeof subtitle === 'string' ? [subtitle] : (subtitle ?? [])
  return (
    <header
      data-screen-header
      className="relative z-20 grid min-h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 bg-km0-yellow-500 px-2 py-1.5 shadow-[var(--shadow-bubble)]"
    >
      <Button
        type="button"
        variant="bubbleSurface"
        size="icon"
        onClick={onBack}
        aria-label={backAriaLabel}
        className="h-11 w-11 shrink-0 rounded-full bg-card text-km0-blue-800"
      >
        <ChevronLeft aria-hidden size={20} />
      </Button>
      <div className="min-w-0 text-left">
        <h1 className="whitespace-nowrap font-brand text-base font-black leading-5 text-km0-blue-800">
          {title}
        </h1>
        {lines.length > 0 && (
          <div className="mt-0.5 font-ui text-xs leading-4 text-km0-blue-800">
            {lines.map((line, index) => (
              <p key={index} className="truncate">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center">{actions}</div>
      ) : (
        <span aria-hidden />
      )}
    </header>
  )
}
export default ScreenHeader
