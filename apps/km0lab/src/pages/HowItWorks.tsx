import { t, type Lang } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import Km0Logo from '@/components/Km0Logo'
import StackCarousel, {
  type StackCarouselItem,
} from '@/components/StackCarousel'
import { useLang } from '@/contexts/LangContext'
import { howItWorksSteps, type HowItWorksStep } from '@/data/howItWorksSteps'
import { cn } from '@/lib/utils'

/**
 * HowItWorks — carrusel explicativo «Com funciona?» (5 pasos).
 *
 * Reutiliza `StackCarousel` (la misma maqueta del onboarding) y el mismo
 * marco de marca. Entra por el enlace «Com funciona?» de la Home y
 * termina en el alta (`/login`).
 */
type HowItWorksSlide = HowItWorksStep & StackCarouselItem

const items: HowItWorksSlide[] = howItWorksSteps.map((s) => ({
  ...s,
  // `color` es obligatorio en StackCarouselItem; el carrusel no lo pinta,
  // lo consume la card como fondo del panel de ilustración.
  color: s.panelClass,
  thumb: null,
}))

const HowItWorks = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [current, setCurrent] = useState(0)

  return (
    <BrandedFrame hideHeader portraitContentClassName="!p-0 !overflow-hidden">
      <div className="relative h-full min-h-0 overflow-hidden bg-background">
        <div className="absolute inset-x-0 top-0 z-40 flex flex-col items-center px-5 pt-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="absolute left-5 top-5 rounded-xl border-[2px] border-km0-blue-700 bg-card text-km0-blue-700 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-km0-blue-50 hover:text-km0-blue-700 active:scale-90"
            aria-label={t('common.back', lang)}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </Button>
          <Km0Logo className="h-9 w-auto max-w-[190px]" />
          <p className="mt-2 max-w-[300px] text-center font-body text-[11px] font-medium leading-snug text-km0-blue-700/80">
            {t('how_it_works.subtitle', lang)}
          </p>
        </div>

        <StackCarousel
          items={items}
          index={current}
          onIndexChange={setCurrent}
          skipLabel={t('how_it_works.skip', lang)}
          finishLabel={t('how_it_works.finish', lang)}
          previousLabel={t('common.previous', lang)}
          nextLabel={t('common.next', lang)}
          onFinish={() => navigate('/login')}
          renderSlideContent={(s, { isActive }) => (
            <HowItWorksCard step={s} isActive={isActive} lang={lang} />
          )}
          renderThumbnail={(s, { isActive }) => {
            const Icon = s.icon
            return (
              <Icon
                size={22}
                strokeWidth={2.2}
                className={isActive ? 'text-primary' : 'text-km0-blue-400'}
              />
            )
          }}
        />
      </div>
    </BrandedFrame>
  )
}

const HowItWorksCard = ({
  step,
  isActive,
  lang,
}: {
  step: HowItWorksSlide
  isActive: boolean
  lang: Lang
}) => {
  const Icon = step.icon
  return (
    <article className="flex h-full flex-col overflow-hidden bg-background pb-32 pt-28">
      <div
        className={cn(
          'relative mx-5 min-h-[150px] flex-1 overflow-hidden rounded-3xl',
          step.panelClass
        )}
      >
        {step.image ? (
          <img
            src={step.image}
            alt={t(step.titleKey, lang)}
            loading={isActive ? 'eager' : 'lazy'}
            className="h-full w-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <Icon
              size={64}
              strokeWidth={1.6}
              className="text-km0-blue-700/45"
            />
            <span className="font-brand text-6xl font-black text-km0-blue-700/20">
              {step.step}
            </span>
          </div>
        )}
      </div>

      <div className="mx-5 mt-4 shrink-0 rounded-xl bg-background/95 px-4 py-3 shadow-md">
        <span className="mb-3 inline-flex rounded-xl bg-km0-yellow-500 px-3 py-1 font-ui text-xs font-bold text-km0-blue-900 shadow-md">
          {t('how_it_works.badge', lang)} {step.step}
        </span>
        <h2 className="max-w-[290px] font-brand text-2xl leading-tight text-km0-blue-800">
          {t(step.titleKey, lang)}
        </h2>
        <p className="mt-3 max-w-[290px] font-body text-sm font-medium leading-relaxed text-muted-foreground">
          {t(step.descKey, lang)}
        </p>
      </div>
    </article>
  )
}

export default HowItWorks
