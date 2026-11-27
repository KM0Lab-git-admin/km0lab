import type { Town } from '@km0lab/app'
import { t, type Lang } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

import BubbleSheet from '@/components/BubbleSheet'
import { TownTag } from '@/components/TownTag'
import { cn } from '@/lib/utils'

interface TownPickerSheetProps {
  open: boolean
  onClose: () => void
  towns: Town[]
  homeTownId: string
  onSave: (town: Town) => void
  lang: Lang
  container?: HTMLElement | null
}

/** "El teu poble" sheet: single choice of the town shown first. */
const TownPickerSheet = ({
  open,
  onClose,
  towns,
  homeTownId,
  onSave,
  lang,
  container,
}: TownPickerSheetProps) => {
  const [selectedId, setSelectedId] = useState(homeTownId)
  useEffect(() => {
    if (open) setSelectedId(homeTownId)
  }, [open, homeTownId])
  const selected = towns.find((town) => town.id === selectedId)
  return (
    <BubbleSheet
      open={open}
      onClose={onClose}
      title={t('territory.homeTown', lang)}
      lang={lang}
      container={container}
    >
      <p className="font-body text-sm text-km0-blue-700">
        {t('territory.pickerText', lang)}
      </p>
      <div
        role="radiogroup"
        aria-label={t('territory.homeTown', lang)}
        className="mt-4 flex flex-col gap-2"
      >
        {towns.map((town) => {
          const checked = town.id === selectedId
          return (
            <Button
              key={town.id}
              type="button"
              role="radio"
              aria-checked={checked}
              variant="bubbleSurface"
              onClick={() => setSelectedId(town.id)}
              className={cn(
                'h-auto min-h-12 justify-start gap-3 rounded-2xl bg-card px-4 py-3 text-left font-ui text-base text-km0-blue-800',
                checked && 'ring-2 ring-km0-blue-700'
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-km0-blue-700',
                  checked && 'bg-km0-blue-700 text-primary-foreground'
                )}
              >
                {checked && <Check className="!h-3 !w-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 truncate">{town.name}</span>
              {town.id === homeTownId && (
                <TownTag townName={town.name} isHome lang={lang} />
              )}
            </Button>
          )
        })}
      </div>
      <p className="mt-4 font-body text-xs text-muted-foreground">
        {t('territory.pointsUnchanged', lang)}
      </p>
      <Button
        type="button"
        variant="bubblePrimary"
        disabled={!selected}
        onClick={() => {
          if (selected) {
            onSave(selected)
            onClose()
          }
        }}
        className="mt-4 w-full"
      >
        {t('territory.save', lang)}
      </Button>
    </BubbleSheet>
  )
}

export default TownPickerSheet
