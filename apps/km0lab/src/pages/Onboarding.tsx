import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandedFrame from '@/components/BrandedFrame'
import StackCarousel, {
  type StackCarouselItem,
} from '@/components/StackCarousel'
import { slides, type Slide } from '@/data/onboardingSlides'
import { useLang } from '@/contexts/LangContext'
import { t, type Lang } from '@km0lab/app'

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
    <div className="relative mx-2 mt-2 shrink-0 h-[clamp(140px,28vh,220px)] rounded-2xl overflow-hidden bg-km0-beige-100">
      <img
        src={slide.image}
        alt={getAlt(slide, lang)}
        loading={isActive ? 'eager' : 'lazy'}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
      {isActive && (
        <span className="absolute top-2 right-2 bg-km0-coral-400 text-white font-ui font-bold text-xs px-2 py-0.5 rounded-xl shadow-md">
          +{slide.xp} XP
        </span>
      )}
    </div>
    <div className="px-3 pt-2 pb-3 text-center flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
      <h2 className="font-brand font-bold text-base text-primary leading-tight mb-1">
        {getTitle(slide, lang)}
      </h2>
      <p className="font-body text-xs text-muted-foreground leading-snug">
        {getDesc(slide, lang)}
      </p>
    </div>
  </div>
)

export default Onboarding
