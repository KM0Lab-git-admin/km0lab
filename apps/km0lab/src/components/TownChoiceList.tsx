import { t, type Lang, type TownChoice } from '@km0lab/app'
import { Button, Skeleton } from '@km0lab/ui'
import { Check } from 'lucide-react'

import TownArt from '@/components/TownArt'
import { cn } from '@/lib/utils'

/*
 * Copia de `src/components/TownChoiceList.tsx` de Lovable (commits 93cd73f y
 * 926e8c7), con los imports de producción. Tiene candado en el manifest
 * porque solo la usa `PostalCode`, que es de producción: el porte no sigue
 * los imports de una pantalla con candado y la daría por huérfana. Un
 * rediseño en Lovable se copia aquí a mano.
 */

interface TownChoiceListProps {
  choices: TownChoice[]
  loading: boolean
  error: string | null
  selectedId: string | null
  onSelect: (choice: TownChoice) => void
  onRetry: () => void
  onBack: () => void
  lang: Lang
}

/** Single-choice list of towns or town groupings; data and actions arrive by props. */
const TownChoiceList = ({
  choices,
  loading,
  error,
  selectedId,
  onSelect,
  onRetry,
  onBack,
  lang,
}: TownChoiceListProps) => {
  if (loading) {
    return (
      <div aria-busy="true" className="flex min-h-72 flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <Skeleton
            key={index}
            data-testid="town-choice-skeleton"
            className="min-h-14 w-full rounded-2xl border border-border bg-card motion-reduce:animate-none"
          />
        ))}
        <p
          aria-live="polite"
          className="pt-1 text-center font-body text-xs text-muted-foreground"
        >
          {t('demo.loading', lang)}
        </p>
      </div>
    )
  }
  if (error) {
    return (
      <div
        role="alert"
        className="flex min-h-72 flex-col items-center gap-3 py-4 text-center"
      >
        <p className="font-body text-sm text-destructive">
          {t('demo.error', lang)}
        </p>
        <Button
          type="button"
          variant="bubbleSurface"
          onClick={onRetry}
          className="rounded-2xl bg-card text-km0-blue-800"
        >
          {t('demo.retry', lang)}
        </Button>
      </div>
    )
  }
  if (choices.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center gap-3 py-4 text-center">
        <p className="font-body text-sm text-muted-foreground">
          {t('demo.empty', lang)}
        </p>
        <Button
          type="button"
          variant="bubbleSurface"
          onClick={onBack}
          className="rounded-2xl bg-card text-km0-blue-800"
        >
          {t('demo.back', lang)}
        </Button>
      </div>
    )
  }
  return (
    <div
      role="radiogroup"
      aria-label={t('demo.title', lang)}
      className="flex min-h-72 flex-col gap-2"
    >
      {choices.map((choice) => {
        const checked = choice.id === selectedId
        const isGroup = choice.towns.length > 1
        return (
          <Button
            key={choice.id}
            type="button"
            role="radio"
            aria-checked={checked}
            variant="bubbleSurface"
            onClick={() => onSelect(choice)}
            className={cn(
              'h-auto min-h-14 justify-start gap-3 rounded-2xl bg-card px-3 py-2 text-left font-ui text-base text-km0-blue-800',
              checked && 'ring-2 ring-km0-blue-700'
            )}
          >
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-km0-yellow-500 p-1"
            >
              <TownArt
                src={choice.artUrl}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{choice.name}</span>
              {isGroup && (
                <span className="whitespace-normal font-body text-xs font-normal text-muted-foreground">
                  {choice.towns.map((town) => town.name).join(', ')}
                </span>
              )}
            </span>
            <span
              aria-hidden
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-km0-blue-700',
                checked && 'bg-km0-blue-700 text-primary-foreground'
              )}
            >
              {checked && <Check className="!h-3 !w-3" strokeWidth={3} />}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

export default TownChoiceList
