import { t, type Lang } from '@km0lab/app'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
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
    <BrandedFrame
      onBack={() => navigate('/')}
      backAriaLabel={t('common.back', lang)}
    >
      <StackCarousel
        items={items}
        index={current}
        onIndexChange={setCurrent}
        skipLabel={t('onboarding.skip', lang)}
        finishLabel={t('onboarding.finish', lang)}
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
  <div className="flex flex-col h-full max-h-full">
    <div
      className="relative mx-3 mt-3 vertical-mobile:mx-2 vertical-mobile:mt-2 wide-landscape:mx-3 wide-landscape:mt-3 short-landscape:mx-2 short-landscape:mt-2 shrink-0 h-[clamp(140px,28vh,220px)] vertical-tablet:h-[240px] wide-landscape:h-[clamp(200px,42vh,320px)] short-landscape:h-[clamp(130px,40vh,200px)] rounded-2xl overflow-hidden"
      style={{ background: slide.color }}
    >
      <img
        src={slide.image}
        alt={getAlt(slide, lang)}
        loading={isActive ? 'eager' : 'lazy'}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      {isActive && (
        <span className="absolute top-2 right-2 vertical-mobile:top-1.5 vertical-mobile:right-1.5 short-landscape:top-1 short-landscape:right-1 bg-km0-coral-400 text-white font-ui font-bold text-xs vertical-tablet:text-sm wide-landscape:text-sm short-landscape:text-[10px] px-2 vertical-tablet:px-3 py-0.5 vertical-tablet:py-1 short-landscape:px-1.5 rounded-xl shadow-md">
          +{slide.xp} XP
        </span>
      )}
    </div>
    <div className="px-3 pt-2 pb-3 vertical-tablet:px-4 vertical-tablet:pt-3 vertical-tablet:pb-4 wide-landscape:px-6 wide-landscape:pt-4 wide-landscape:pb-5 short-landscape:px-3 short-landscape:pt-1.5 short-landscape:pb-2 text-center flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
      <h2 className="font-brand font-bold text-base vertical-tablet:text-lg wide-landscape:text-xl short-landscape:text-[clamp(11px,2vh,15px)] text-primary leading-tight mb-1 wide-landscape:mb-2 short-landscape:mb-0.5">
        {getTitle(slide, lang)}
      </h2>
      <p className="font-body text-xs vertical-tablet:text-sm wide-landscape:text-sm short-landscape:text-[clamp(9px,1.5vh,12px)] text-muted-foreground leading-snug">
        {getDesc(slide, lang)}
      </p>
    </div>
  </div>
)

export default Onboarding
