import { cn } from '@km0lab/ui/lib/utils'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { Km0Logo } from '../../components/Km0Logo'
import onboarding from '../../locales/onboarding.json'

type Lang = 'ca' | 'es' | 'en'

const slideColor: Record<string, string> = {
  'km0-yellow-300': 'hsl(var(--km0-yellow-300))',
  'km0-teal-300': 'hsl(var(--km0-teal-300))',
  'km0-coral-300': 'hsl(var(--km0-coral-300))',
  'km0-blue-300': 'hsl(var(--km0-blue-300))',
  'km0-beige-300': 'hsl(var(--km0-beige-300))',
}

const SLOT = 260

function getLang(lang: string | string[] | undefined): Lang {
  if (lang === 'ca' || lang === 'es' || lang === 'en') {
    return lang
  }
  return 'es'
}

function getSlotLandscape() {
  if (typeof window === 'undefined') return 420
  return window.innerWidth >= 1000 ? 610 : 390
}

function isInteractivePointerTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('button'))
}

export default function OnboardingWebScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ lang?: string | string[] }>()
  const lang = getLang(params.lang)

  const [current, setCurrent] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [containerWidth, setContainerWidth] = useState(390)
  const [containerWidthLs, setContainerWidthLs] = useState(1200)
  const [portraitScale, setPortraitScale] = useState(1)
  const [slotLs, setSlotLs] = useState(420)

  const touchStartX = useRef<number | null>(null)
  const touchStartXLs = useRef<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const carouselRefLs = useRef<HTMLDivElement>(null)

  const measure = useCallback(() => {
    if (carouselRef.current) setContainerWidth(carouselRef.current.offsetWidth)
    if (carouselRefLs.current) setContainerWidthLs(carouselRefLs.current.offsetWidth)
    if (typeof window !== 'undefined') {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches
      const isTabletPortrait = window.matchMedia(
        '(orientation: portrait) and (min-width: 768px) and (min-height: 1024px)'
      ).matches
      setPortraitScale(isPortrait && isTabletPortrait ? 1.35 : 1)
      setSlotLs(getSlotLandscape())
    }
  }, [])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const slides = onboarding.slides
  const total = slides.length
  const isFirst = current === 0
  const isLast = current === total - 1

  const prev = () => {
    if (!isFirst) setCurrent((value) => value - 1)
  }
  const next = () => {
    if (!isLast) setCurrent((value) => value + 1)
  }
  const goTo = (index: number) => setCurrent(index)
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/language-selection')
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (isInteractivePointerTarget(event.target)) return
    touchStartX.current = event.clientX
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  const handlePointerMove = (event: React.PointerEvent) => {
    if (touchStartX.current === null) return
    setDragOffset(event.clientX - touchStartX.current)
  }
  const handlePointerUp = (event: React.PointerEvent) => {
    if (isInteractivePointerTarget(event.target)) return
    const el = event.currentTarget as HTMLElement
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
    if (touchStartX.current === null) return
    const delta = touchStartX.current - event.clientX
    touchStartX.current = null
    setDragOffset(0)
    if (Math.abs(delta) > 40) {
      if (delta > 0) next()
      else prev()
    }
  }

  const handlePointerDownLs = (event: React.PointerEvent) => {
    if (isInteractivePointerTarget(event.target)) return
    touchStartXLs.current = event.clientX
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  const handlePointerMoveLs = (event: React.PointerEvent) => {
    if (touchStartXLs.current === null) return
    setDragOffset(event.clientX - touchStartXLs.current)
  }
  const handlePointerUpLs = (event: React.PointerEvent) => {
    if (isInteractivePointerTarget(event.target)) return
    const el = event.currentTarget as HTMLElement
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
    if (touchStartXLs.current === null) return
    const delta = touchStartXLs.current - event.clientX
    touchStartXLs.current = null
    setDragOffset(0)
    if (Math.abs(delta) > 40) {
      if (delta > 0) next()
      else prev()
    }
  }

  const skipLabel = isLast ? onboarding.ui.start[lang] : onboarding.ui.skip[lang]
  const trackX = containerWidth / 2 - current * SLOT - SLOT / 2
  const trackXLs = containerWidthLs / 2 - current * slotLs - slotLs / 2

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 p-2 horizontal-mobile:p-2 horizontal-desktop:p-4">
      <div className="mx-auto flex h-full w-full max-w-[390px] flex-col gap-3 overflow-hidden py-2 vertical-tablet:max-w-[460px] vertical-tablet:py-6 horizontal-mobile:hidden horizontal-desktop:hidden">
        <div className="flex items-center justify-between pb-2">
          <div className="flex flex-1 justify-start">
            <button
              onClick={handleBack}
              className="h-11 w-11 rounded-xl border-2 border-dashed border-km0-yellow-500 font-sans text-2xl font-bold leading-none text-km0-yellow-600 hover:bg-km0-yellow-50"
              aria-label="back"
            >
              ←
            </button>
          </div>
          <Km0Logo width={180} height={33} />
          <div className="flex-1" />
        </div>

        <div
          ref={carouselRef}
          className="relative flex-1 min-h-[300px] cursor-grab select-none overflow-visible vertical-tablet:min-h-[440px]"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${portraitScale})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="absolute top-1/2 flex items-start"
              style={{
                transform: `translateX(${trackX + dragOffset / portraitScale}px) translateY(-50%)`,
                transition:
                  dragOffset !== 0
                    ? 'none'
                    : 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1)',
                width: `${total * SLOT}px`,
              }}
            >
              {slides.map((slide, index) => {
                const distance = Math.abs(index - current)
                const isActive = index === current
                const scale = isActive ? 1 : distance === 1 ? 0.92 : 0.76
                const opacity = isActive ? 1 : distance === 1 ? 0.85 : 0.45
                const topOffset = isActive ? 0 : distance === 1 ? 12 : 32
                return (
                  <div
                    key={slide.id}
                    onClick={() => {
                      if (!isActive) goTo(index)
                    }}
                    style={{
                      width: `${SLOT}px`,
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      transform: `scale(${scale}) translateY(${topOffset}px)`,
                      opacity,
                      transition:
                        'transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease',
                      transformOrigin: 'top center',
                      cursor: isActive ? 'default' : 'pointer',
                      zIndex: isActive ? 10 : 1,
                      position: 'relative',
                    }}
                  >
                    {isActive ? (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -10,
                            left: 22,
                            right: 22,
                            height: 28,
                            background: 'rgba(255,255,255,0.55)',
                            borderRadius: 20,
                            zIndex: -1,
                            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.10)',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -18,
                            left: 38,
                            right: 38,
                            height: 28,
                            background: 'rgba(255,255,255,0.30)',
                            borderRadius: 20,
                            zIndex: -2,
                            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)',
                          }}
                        />
                      </>
                    ) : null}

                    <div className={`overflow-hidden rounded-3xl bg-white ${isActive ? 'shadow-2xl' : ''}`}>
                      <div
                        className="relative mx-3 mt-3 flex h-[180px] items-center justify-center overflow-hidden rounded-2xl"
                        style={{ background: slideColor[slide.color] }}
                      >
                        <span className="select-none text-[70px]">{slide.emoji}</span>
                        {isActive ? (
                          <span className="absolute right-3 top-3 rounded-xl bg-km0-coral-400 px-3 py-1 font-ui text-sm font-bold text-white shadow-md">
                            +{slide.xp} XP
                          </span>
                        ) : null}
                      </div>
                      <div className="px-4 pb-4 pt-3 text-center">
                        <h2 className="mb-1 font-brand text-lg font-bold leading-tight text-primary">
                          {slide.title[lang]}
                        </h2>
                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                          {slide.description[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={prev}
              disabled={isFirst}
              className={cn(
                'absolute left-[6px] top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border-2 bg-white shadow-lg',
                isFirst
                  ? 'border-km0-beige-200 text-km0-beige-300 opacity-40'
                  : 'border-km0-yellow-400 font-sans text-2xl font-bold leading-none text-km0-blue-700 hover:bg-km0-yellow-50'
              )}
              aria-label="prev"
            >
              ←
            </button>
            <button
              onClick={next}
              disabled={isLast}
              className={cn(
                'absolute right-[6px] top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border-2 bg-white shadow-lg',
                isLast
                  ? 'border-km0-beige-200 text-km0-beige-300 opacity-40'
                  : 'border-km0-yellow-400 font-sans text-2xl font-bold leading-none text-km0-blue-700 hover:bg-km0-yellow-50'
              )}
              aria-label="next"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goTo(index)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl',
                index === current
                  ? 'scale-110 border-km0-yellow-500 bg-km0-yellow-200 shadow-md'
                  : 'border-km0-beige-300 bg-white opacity-80'
              )}
            >
              {slide.emoji}
            </button>
          ))}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-km0-beige-200/70 bg-white/40 px-1 py-2">
          <span className="font-ui text-3xl font-bold text-primary">
            {current + 1}/{total}
          </span>

          <div className="flex flex-1 justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={`dot-${slide.id}`}
                onClick={() => goTo(index)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  index === current
                    ? 'h-4 w-4 bg-km0-yellow-500'
                    : 'h-2.5 w-2.5 bg-km0-blue-200'
                )}
                aria-label={`dot ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!isLast) setCurrent(total - 1)
            }}
            className="rounded-2xl bg-primary px-5 py-2.5 font-ui text-sm font-semibold text-primary-foreground"
          >
            {skipLabel}
          </button>
        </footer>
      </div>

      <div className="language-landscape-card hidden overflow-hidden rounded-3xl border-2 border-km0-blue-500 bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 horizontal-mobile:flex horizontal-mobile:flex-col horizontal-desktop:flex horizontal-desktop:flex-col">
        <header className="relative flex items-center justify-center py-2">
          <button
            onClick={handleBack}
            className="absolute left-3 h-9 w-9 rounded-xl border-2 border-dashed border-km0-yellow-500 font-sans text-2xl font-bold leading-none text-km0-yellow-600"
            aria-label="back"
          >
            ←
          </button>
          <Km0Logo width={180} height={33} />
        </header>

        <div
          ref={carouselRefLs}
          className="relative flex-1 select-none overflow-visible px-8"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDownLs}
          onPointerMove={handlePointerMoveLs}
          onPointerUp={handlePointerUpLs}
          onPointerCancel={handlePointerUpLs}
        >
          <div
            className="absolute top-1/2 flex items-center"
            style={{
              transform: `translateX(${trackXLs + dragOffset}px) translateY(-52%)`,
              transition:
                dragOffset !== 0 ? 'none' : 'transform 420ms cubic-bezier(0.4, 0, 0.2, 1)',
              width: `${total * slotLs}px`,
            }}
          >
            {slides.map((slide, index) => {
              const distance = Math.abs(index - current)
              const isActive = index === current
              const scale = isActive ? 1 : distance === 1 ? 0.94 : 0.82
              const opacity = isActive ? 1 : distance === 1 ? 0.85 : 0.45
              return (
                <div
                  key={`land-${slide.id}`}
                  onClick={() => {
                    if (!isActive) goTo(index)
                  }}
                  style={{
                    width: `${slotLs}px`,
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    transform: `scale(${scale})`,
                    opacity,
                    transition:
                      'transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease',
                    transformOrigin: 'center center',
                    position: 'relative',
                  }}
                >
                  <div className={`overflow-hidden rounded-3xl bg-white ${isActive ? 'shadow-2xl' : ''}`}>
                    <div
                      className="relative mx-3 mt-3 flex h-[170px] items-center justify-center overflow-hidden rounded-2xl horizontal-mobile:h-[120px]"
                      style={{ background: slideColor[slide.color] }}
                    >
                      <span className="select-none text-[84px] horizontal-mobile:text-[52px]">
                        {slide.emoji}
                      </span>
                      {isActive ? (
                        <span className="absolute right-3 top-3 rounded-xl bg-km0-coral-400 px-3 py-1 font-ui text-sm font-bold text-white shadow-md horizontal-mobile:text-[10px]">
                          +{slide.xp} XP
                        </span>
                      ) : null}
                    </div>
                    <div className="px-4 pb-4 pt-3 text-center horizontal-mobile:px-3 horizontal-mobile:pb-3 horizontal-mobile:pt-2">
                      <h2 className="mb-1 font-brand text-lg font-bold leading-tight text-primary horizontal-mobile:text-sm">
                        {slide.title[lang]}
                      </h2>
                      <p className="font-body text-sm leading-snug text-muted-foreground horizontal-mobile:text-[11px]">
                        {slide.description[lang]}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={prev}
            disabled={isFirst}
            className={cn(
              'absolute left-1 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full border-2 bg-white shadow-lg',
              isFirst
                ? 'border-km0-beige-200 text-km0-beige-300 opacity-40'
                : 'border-km0-yellow-400 font-sans text-2xl font-bold leading-none text-km0-blue-700'
            )}
            aria-label="prev"
          >
            ←
          </button>
          <button
            onClick={next}
            disabled={isLast}
            className={cn(
              'absolute right-1 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full border-2 bg-white shadow-lg',
              isLast
                ? 'border-km0-beige-200 text-km0-beige-300 opacity-40'
                : 'border-km0-yellow-400 font-sans text-2xl font-bold leading-none text-km0-blue-700'
            )}
            aria-label="next"
          >
            →
          </button>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-km0-beige-300 bg-white/40 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="font-ui text-base font-bold text-primary">
              {current + 1}/{total}
            </span>
            <div className="flex gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={`thumb-land-${slide.id}`}
                  onClick={() => goTo(index)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm',
                    index === current
                      ? 'border-km0-yellow-500 bg-km0-yellow-100'
                      : 'border-km0-yellow-300 bg-white'
                  )}
                >
                  {slide.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={`dot-land-${slide.id}`}
                onClick={() => goTo(index)}
                className={cn(
                  'rounded-full',
                  index === current
                    ? 'h-3.5 w-3.5 bg-km0-yellow-500'
                    : 'h-2.5 w-2.5 bg-km0-blue-200'
                )}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!isLast) setCurrent(total - 1)
            }}
            className="hidden rounded-2xl bg-primary px-4 py-2 font-ui text-sm font-semibold text-primary-foreground horizontal-desktop:inline-flex"
          >
            {skipLabel}
          </button>
        </footer>
      </div>

    </div>
  )
}
