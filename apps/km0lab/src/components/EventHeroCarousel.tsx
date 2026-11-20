import { useDragScroll, t } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { MapPin, CalendarDays } from 'lucide-react'
import { useState } from 'react'

import type { Promo } from '@km0lab/app'

import cine from '@/assets/burbuja/cover-cine.webp.asset.json'
import culture from '@/assets/burbuja/cover-cultura.webp.asset.json'
import market from '@/assets/burbuja/cover-mercado.webp.asset.json'
import nature from '@/assets/burbuja/cover-naturaleza.webp.asset.json'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

export interface EventHeroCarouselProps {
  promos: Promo[]
  onOpen?: (id: string) => void
}
const categoryCover = (promo: Promo): string => {
  const category = promo.badge.text.toLowerCase()
  if (/cine/.test(category)) return cine.url
  if (/natura/.test(category)) return nature.url
  if (/merc/.test(category)) return market.url
  return culture.url
}
const EventHeroCarousel = ({ promos, onOpen }: EventHeroCarouselProps) => {
  const { lang } = useLang()
  const track = useDragScroll('horizontal')
  const [index, setIndex] = useState(0)
  return (
    <div className="min-w-0">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none data-[dragging=true]:snap-none"
        onScroll={(event) => {
          const el = event.currentTarget
          const first = el.firstElementChild
          if (first)
            setIndex(
              Math.round(
                el.scrollLeft / (first.getBoundingClientRect().width + 12)
              )
            )
        }}
      >
        {promos.map((promo) => (
          <Button
            key={promo.id}
            variant="bubbleSurface"
            onClick={() => onOpen?.(promo.id)}
            aria-label={t('home.event.open', lang).replace(
              '{title}',
              promo.title
            )}
            className="h-auto min-w-0 basis-[84%] shrink-0 snap-start flex-col items-stretch justify-start gap-0 overflow-hidden whitespace-normal rounded-3xl bg-card p-0 text-left shadow-[var(--shadow-bubble)]"
          >
            <span className="relative block aspect-video w-full overflow-hidden bg-km0-beige-100">
              <img
                src={promo.images[0] || categoryCover(promo)}
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = categoryCover(promo)
                }}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-16px)] items-center gap-1 rounded-full bg-card px-2 py-1 font-ui text-[11px] font-bold text-km0-blue-800">
                <CalendarDays aria-hidden />
                {promo.dateRange}
              </span>
            </span>
            <span className="flex flex-col gap-2 p-3">
              <span className="line-clamp-2 min-h-10 font-brand text-[17px] font-black leading-tight text-km0-blue-800">
                {promo.title}
              </span>
              <span className="flex items-start gap-1.5 font-ui text-xs text-km0-blue-700">
                <MapPin aria-hidden />
                {promo.location}
              </span>
            </span>
          </Button>
        ))}
      </div>
      <div className="flex justify-center">
        {promos.map((promo, i) => (
          <Button
            key={promo.id}
            variant="bubbleSurface"
            aria-label={t('home.event.page', lang).replace(
              '{n}',
              String(i + 1)
            )}
            aria-current={index === i ? 'true' : undefined}
            className="h-6 w-6 rounded-full p-0"
            onClick={() => {
              const el = track.current
              const child = el?.children.item(i)
              if (el && child instanceof HTMLElement)
                el.scrollTo({
                  left:
                    child.offsetLeft -
                    (el.firstElementChild instanceof HTMLElement
                      ? el.firstElementChild.offsetLeft
                      : 0),
                  behavior: window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                  ).matches
                    ? 'instant'
                    : 'smooth',
                })
            }}
          >
            <span
              className={cn(
                'h-1.5 rounded-full',
                index === i ? 'w-5 bg-km0-blue-700' : 'w-1.5 bg-km0-blue-700/25'
              )}
            />
          </Button>
        ))}
      </div>
    </div>
  )
}
export default EventHeroCarousel
