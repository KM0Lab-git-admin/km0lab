import { Button } from '@km0lab/ui'
import { ChevronRight } from 'lucide-react'

import type { Lang } from '@km0lab/app'

import { cn } from '@/lib/utils'

interface LanguageCardProps {
  flag: string
  flagIsImage?: boolean
  lang: Lang
  name: string
  description: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

const LanguageCard = ({
  flag,
  flagIsImage = false,
  lang,
  name,
  description,
  selected = false,
  disabled = false,
  onClick,
  style,
}: LanguageCardProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      style={style}
      className={cn(
        'h-auto min-h-[60px] w-full flex items-center justify-start gap-3 px-4 py-2 rounded-2xl text-left whitespace-normal border border-solid',
        'transition-all duration-[120ms] ease-out animate-fade-in-up motion-reduce:animate-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary',
        disabled
          ? 'bg-muted border-border cursor-not-allowed'
          : cn(
              'cursor-pointer active:scale-[0.98] shadow-sm',
              selected
                ? 'border-km0-yellow-500 bg-km0-yellow-50 hover:bg-km0-yellow-50'
                : 'border-km0-blue-700/20 bg-card hover:bg-card'
            )
      )}
    >
      {/* Flag */}
      <span
        className={cn(
          'flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full overflow-hidden',
          disabled
            ? 'bg-muted grayscale'
            : selected
              ? 'bg-km0-yellow-100'
              : 'bg-km0-beige-50'
        )}
        aria-hidden="true"
      >
        {flagIsImage ? (
          <img
            src={flag}
            alt=""
            className="w-7 h-7 object-cover rounded-full"
          />
        ) : (
          <span className="text-3xl">{flag}</span>
        )}
      </span>

      {/* Text */}
      <div lang={lang} className="flex-1 min-w-0">
        <p
          className={cn(
            'font-ui font-semibold text-base leading-tight',
            disabled ? 'text-muted-foreground' : 'text-primary'
          )}
        >
          {name}
        </p>
        <p className="font-body text-xs mt-0.5 text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={22}
        aria-hidden="true"
        className="!size-[22px] text-primary"
      />
    </Button>
  )
}

export default LanguageCard
