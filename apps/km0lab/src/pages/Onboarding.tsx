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
import { slides, type Slide } from '@/data/onboardingSlides'

const getTitle = (slide: Slide, lang: Lang) =>
  lang === 'ca' ? slide.titleCa : lang === 'en' ? slide.titleEn : slide.titleEs

const getDesc = (slide: Slide, lang: Lang) =>
  lang === 'ca' ? slide.descCa : lang === 'en' ? slide.descEn : slide.descEs

const getAlt = (slide: Slide, lang: Lang) =>
  lang === 'ca' ? slide.altCa : lang === 'en' ? slide.altEn : slide.altEs

type OnboardingSlide = Slide & StackCarouselItem
const items: OnboardingSlide[] = slides.map((s) => ({ ...s, thumb: null }))

const Onboarding = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [current, setCurrent] = useState(0)

  return (
    <BrandedFrame hideHeader portraitContentClassName="!p-0 !overflow-hidden">
      <div className="relative h-full min-h-0 overflow-hidden bg-background">
        <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-center px-5 pt-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="absolute left-5 rounded-xl border-2 border-dashed border-km0-yellow-500 bg-km0-blue-900/60 text-km0-yellow-400 backdrop-blur-sm hover:bg-km0-blue-800"
            aria-label={t('common.back', lang)}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </Button>
          <Km0Logo className="h-9 w-auto max-w-[190px] drop-shadow-lg" />
        </div>

        <StackCarousel
          items={items}
          index={current}
          onIndexChange={setCurrent}
          skipLabel={t('onboarding.skip', lang)}
          finishLabel={t('onboarding.finish', lang)}
          previousLabel={t('common.previous', lang)}
          nextLabel={t('common.next', lang)}
          onFinish={() => navigate('/postal-code')}
          renderSlideContent={(s, { isActive }) => (
            <OnboardingCard slide={s} isActive={isActive} lang={lang} />
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

const OnboardingCard = ({
  slide,
  isActive,
  lang,
}: {
  slide: OnboardingSlide
  isActive: boolean
  lang: Lang
}) => (
  <article className="relative h-full overflow-hidden bg-background">
    <div className="absolute inset-0 bg-background">
      <img
        src={slide.image}
        alt={getAlt(slide, lang)}
        loading={isActive ? 'eager' : 'lazy'}
        className="absolute inset-x-0 top-24 h-auto w-full object-contain select-none pointer-events-none"
        draggable={false}
      />
    </div>
    <div className="absolute inset-x-5 bottom-32 z-10 rounded-xl bg-background/95 px-3 py-3 shadow-md">
      {isActive && (
        <span className="mb-3 inline-flex rounded-xl bg-km0-yellow-500 px-3 py-1 font-ui text-xs font-bold text-km0-blue-900 shadow-md">
          +{slide.xp} XP
        </span>
      )}
      <h2 className="max-w-[290px] font-brand text-3xl text-foreground leading-tight">
        {getTitle(slide, lang)}
      </h2>
      <p className="mt-3 max-w-[290px] font-body text-sm font-medium text-muted-foreground leading-relaxed">
        {getDesc(slide, lang)}
      </p>
    </div>
  </article>
)

export default Onboarding
