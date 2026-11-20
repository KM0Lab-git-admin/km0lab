import { t, type Lang } from '@km0lab/app'

import { cn } from '@/lib/utils'

interface TownTagProps {
  /** Neighbour towns show their name; the home town reads "El teu poble". */
  townName: string
  isHome?: boolean
  lang: Lang
  className?: string
}

/** Pill naming where an item comes from; origin is always readable as text. */
export function TownTag({
  townName,
  isHome = false,
  lang,
  className,
}: TownTagProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center px-1.5 py-0.5 rounded-full text-[10px] font-ui',
        isHome
          ? 'bg-km0-yellow-100 text-km0-yellow-800 font-bold'
          : 'bg-km0-blue-50 text-km0-blue-700',
        className
      )}
    >
      {isHome ? t('territory.homeTown', lang) : townName}
    </span>
  )
}
