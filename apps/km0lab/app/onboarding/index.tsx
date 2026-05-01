import { Text } from '@km0lab/ui'
import { cn } from '@km0lab/ui/lib/utils'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PanResponder,
  Pressable,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { Km0Logo } from '../../components/Km0Logo'
import onboarding from '../../locales/onboarding.json'

const SLOT_PORTRAIT = 260
const DRAG_THRESHOLD = 40

type Lang = 'ca' | 'es' | 'en'
type Slide = (typeof onboarding.slides)[number]

const slideColorClassName: Record<Slide['color'], string> = {
  'km0-yellow-300': 'bg-km0-yellow-300',
  'km0-teal-300': 'bg-km0-teal-300',
  'km0-coral-300': 'bg-km0-coral-300',
  'km0-blue-300': 'bg-km0-blue-300',
  'km0-beige-300': 'bg-km0-beige-300',
}

function getSlotLandscape(width: number) {
  return width >= 1000 ? 560 : 360
}

function getLang(value: string | string[] | undefined): Lang {
  if (value === 'ca' || value === 'en' || value === 'es') {
    return value
  }
  return 'es'
}

function getTitle(slide: Slide, lang: Lang) {
  return slide.title[lang]
}

function getDescription(slide: Slide, lang: Lang) {
  return slide.description[lang]
}

export default function OnboardingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ lang?: string | string[] }>()
  const lang = getLang(params.lang)

  const { width, height } = useWindowDimensions()
  const isLandscape = width > height
  const slotLandscape = getSlotLandscape(width)
  const activeSlot = isLandscape ? slotLandscape : SLOT_PORTRAIT

  const [current, setCurrent] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [portraitWidth, setPortraitWidth] = useState(375)
  const [landscapeWidth, setLandscapeWidth] = useState(1280)
  const [isDragging, setIsDragging] = useState(false)

  const containerWidth = isLandscape ? landscapeWidth : portraitWidth
  const total = onboarding.slides.length
  const isFirst = current === 0
  const isLast = current === total - 1
  const dragRatio = dragOffset / activeSlot

  const rootOpacity = useSharedValue(0)
  const headerY = useSharedValue(-20)
  const carouselScale = useSharedValue(0.96)
  const footerY = useSharedValue(16)

  useEffect(() => {
    rootOpacity.value = withTiming(1, { duration: 350 })
    headerY.value = withDelay(
      100,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    )
    carouselScale.value = withDelay(
      200,
      withTiming(1, {
        duration: 450,
        easing: Easing.out(Easing.cubic),
      })
    )
    footerY.value = withDelay(
      350,
      withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      })
    )
  }, [carouselScale, footerY, headerY, rootOpacity])

  const rootAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rootOpacity.value,
  }))

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
    opacity: rootOpacity.value,
  }))

  const carouselAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: carouselScale.value }],
    opacity: rootOpacity.value,
  }))

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: footerY.value }],
    opacity: rootOpacity.value,
  }))

  const handlePointerEnd = useCallback((finalOffset: number) => {
    setIsDragging(false)
    setDragOffset(0)
    if (Math.abs(finalOffset) <= DRAG_THRESHOLD) {
      return
    }
    if (finalOffset < 0) {
      setCurrent((value) => Math.min(value + 1, total - 1))
      return
    }
    setCurrent((value) => Math.max(value - 1, 0))
  }, [total])

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 6,
        onPanResponderGrant: () => {
          setIsDragging(true)
        },
        onPanResponderMove: (_, gestureState) => {
          setDragOffset(gestureState.dx)
        },
        onPanResponderRelease: (_, gestureState) => {
          handlePointerEnd(gestureState.dx)
        },
        onPanResponderTerminate: (_, gestureState) => {
          handlePointerEnd(gestureState.dx)
        },
      }),
    [handlePointerEnd]
  )

  const trackTranslateX =
    containerWidth / 2 - current * activeSlot - activeSlot / 2 + dragOffset

  const skipLabel = isLast ? onboarding.ui.start[lang] : onboarding.ui.skip[lang]

  function goTo(index: number) {
    setCurrent(Math.max(0, Math.min(total - 1, index)))
  }

  function goNext() {
    if (!isLast) {
      setCurrent((value) => value + 1)
    }
  }

  function goPrev() {
    if (!isFirst) {
      setCurrent((value) => value - 1)
    }
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/')
  }

  return (
    <Animated.View style={rootAnimatedStyle} className="flex-1">
      <SafeAreaView className="language-screen-root h-screen min-h-screen w-screen flex-1 bg-background web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 horizontal-mobile:items-center horizontal-mobile:justify-center horizontal-mobile:p-2 horizontal-desktop:items-center horizontal-desktop:justify-center horizontal-desktop:p-4">
        <View className="relative w-full flex-1 flex-col items-center px-4 pb-3 pt-3 vertical-tablet:pt-5 horizontal-mobile:hidden horizontal-desktop:hidden">
          <Animated.View style={headerAnimatedStyle} className="w-full">
            <View className="flex-row items-center justify-between py-1">
              <View className="w-12 items-start">
                <Pressable
                  onPress={handleBack}
                  className="h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-km0-yellow-500 bg-km0-beige-50"
                >
                  <Text className="text-xl text-km0-yellow-600">‹</Text>
                </Pressable>
              </View>
              <Km0Logo width={188} height={35} />
              <View className="w-12" />
            </View>
          </Animated.View>

          <Animated.View
            style={carouselAnimatedStyle}
            className="mt-2 w-full flex-1 justify-center"
            onLayout={(event) => {
              setPortraitWidth(event.nativeEvent.layout.width)
            }}
          >
            <View
              {...panResponder.panHandlers}
              className="relative min-h-80 flex-1 justify-center overflow-visible pb-8 web:cursor-grab web:select-none web:touch-none web:active:cursor-grabbing vertical-tablet:min-h-96 vertical-tablet:pb-12"
            >
              <View
                className="absolute top-1/2 flex-row items-start"
                style={{
                  transform: [
                    { translateX: trackTranslateX },
                    { translateY: -70 },
                  ],
                }}
              >
                {onboarding.slides.map((slide, index) => {
                  const distance = Math.abs(index - current - dragRatio)
                  const isActive = index === current
                  const scale = isActive ? 1 : distance <= 1 ? 0.92 : 0.76
                  const opacity = isActive ? 1 : distance <= 1 ? 0.85 : 0.45
                  const topOffset = isActive ? 0 : distance <= 1 ? 12 : 32
                  return (
                    <Pressable
                      key={slide.id}
                      onPress={() => {
                        if (!isDragging) {
                          setCurrent(index)
                        }
                      }}
                      className="px-1"
                      style={{
                        width: SLOT_PORTRAIT,
                        transform: [
                          { scale },
                          { translateY: topOffset },
                        ],
                        opacity,
                      }}
                    >
                      <View
                        className={cn(
                          'rounded-3xl bg-white p-3 shadow-km0-card',
                          isActive && 'web:shadow-2xl'
                        )}
                      >
                        <View
                          className={cn(
                            'relative h-44 items-center justify-center rounded-2xl border border-km0-beige-200',
                            slideColorClassName[slide.color]
                          )}
                        >
                          <Text className="text-6xl">{slide.emoji}</Text>
                          {isActive ? (
                            <View className="absolute right-3 top-3 rounded-2xl bg-km0-coral-400 px-3 py-1 shadow">
                              <Text className="font-ui text-sm font-bold text-white">
                                +{slide.xp} XP
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <View className="px-2 pb-2 pt-3">
                          <Text className="text-center font-brand text-base font-bold text-primary">
                            {getTitle(slide, lang)}
                          </Text>
                          <Text className="mt-1 text-center font-body text-sm leading-6 text-muted-foreground">
                            {getDescription(slide, lang)}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </View>

              <Pressable
                onPress={goPrev}
                disabled={isFirst}
                className={cn(
                  'absolute left-0 top-1/2 h-10 w-10 -translate-y-5 items-center justify-center rounded-full border-2 bg-white shadow',
                  isFirst
                    ? 'border-km0-beige-200 text-km0-beige-300 opacity-50'
                    : 'border-km0-yellow-400 text-km0-blue-700'
                )}
              >
                <Text className="text-lg">‹</Text>
              </Pressable>

              <Pressable
                onPress={goNext}
                disabled={isLast}
                className={cn(
                  'absolute right-0 top-1/2 h-10 w-10 -translate-y-5 items-center justify-center rounded-full border-2 bg-white shadow',
                  isLast
                    ? 'border-km0-beige-200 text-km0-beige-300 opacity-50'
                    : 'border-km0-yellow-400 text-km0-blue-700'
                )}
              >
                <Text className="text-lg">›</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            style={footerAnimatedStyle}
            className="mt-3 w-full gap-2"
          >
            <View className="flex-row items-center justify-center gap-2">
              {onboarding.slides.map((slide, index) => (
                <Pressable
                  key={slide.id}
                  onPress={() => goTo(index)}
                  className={cn(
                    'h-11 w-11 items-center justify-center rounded-2xl border-2',
                    index === current
                      ? 'border-km0-yellow-500 bg-km0-yellow-100 shadow'
                      : 'border-km0-beige-300 bg-km0-beige-50'
                  )}
                >
                  <Text className="text-lg">{slide.emoji}</Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="font-ui text-lg font-bold text-primary">
                {current + 1}/{total}
              </Text>
              <View className="flex-row items-center gap-2">
                {onboarding.slides.map((slide, index) => (
                  <Pressable
                    key={`dot-${slide.id}`}
                    onPress={() => goTo(index)}
                    className={cn(
                      'rounded-full',
                      index === current
                        ? 'h-4 w-4 bg-km0-yellow-500'
                        : 'h-3 w-3 bg-km0-blue-200'
                    )}
                  />
                ))}
              </View>
              <Pressable
                onPress={() => {
                  if (!isLast) {
                    goTo(total - 1)
                  }
                }}
                className="rounded-3xl bg-primary px-5 py-2"
              >
                <Text className="font-ui text-sm font-semibold text-white">
                  {skipLabel}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>

        <View className="language-landscape-card relative hidden flex-col overflow-hidden rounded-3xl border-2 border-km0-blue-700/80 bg-background web:mx-auto web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 web:shadow-km0-landscape horizontal-mobile:flex horizontal-desktop:flex">
          <Animated.View style={headerAnimatedStyle}>
            <View className="flex-row items-center justify-center pb-2 pt-3 horizontal-mobile:scale-82 horizontal-mobile:pb-2 horizontal-mobile:pt-3">
              <Pressable
                onPress={handleBack}
                className="absolute left-4 h-10 w-10 items-center justify-center rounded-2xl border-2 border-dashed border-km0-yellow-500 bg-km0-beige-50"
              >
                <Text className="text-xl text-km0-yellow-600">‹</Text>
              </Pressable>
              <Km0Logo width={242} height={44} />
            </View>
          </Animated.View>

          <Animated.View
            style={carouselAnimatedStyle}
            className="min-h-0 flex-1"
            onLayout={(event) => {
              setLandscapeWidth(event.nativeEvent.layout.width)
            }}
          >
            <View
              {...panResponder.panHandlers}
              className="relative min-h-0 flex-1 overflow-visible px-6 pb-18 web:cursor-grab web:select-none web:touch-none web:active:cursor-grabbing horizontal-mobile:px-4 horizontal-mobile:pb-16"
            >
              <View
                className="absolute top-1/2 flex-row items-center"
                style={{
                  transform: [
                    { translateX: trackTranslateX },
                    { translateY: -18 },
                  ],
                }}
              >
                {onboarding.slides.map((slide, index) => {
                  const distance = Math.abs(index - current - dragRatio)
                  const scale = index === current ? 1 : distance <= 1 ? 0.88 : 0.74
                  const opacity = index === current ? 1 : distance <= 1 ? 0.85 : 0.45
                  return (
                    <Pressable
                      key={slide.id}
                      onPress={() => {
                        if (!isDragging) {
                          setCurrent(index)
                        }
                      }}
                      className="px-2"
                      style={{
                        width: activeSlot,
                        transform: [{ scale }],
                        opacity,
                      }}
                    >
                      <View
                        className={cn(
                          'rounded-3xl bg-white p-2 shadow-km0-card',
                          index === current && 'web:shadow-2xl'
                        )}
                      >
                        <View
                          className={cn(
                            'relative h-32 items-center justify-center rounded-2xl border border-km0-beige-200',
                            slideColorClassName[slide.color]
                          )}
                        >
                          <Text className="text-5xl">{slide.emoji}</Text>
                          {index === current ? (
                            <View className="absolute right-2 top-2 rounded-xl bg-km0-coral-400 px-2 py-1">
                              <Text className="font-ui text-xs font-bold text-white">
                                +{slide.xp} XP
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <View className="px-2 pb-2 pt-2">
                          <Text className="text-center font-brand text-base font-bold text-primary horizontal-desktop:text-lg">
                            {getTitle(slide, lang)}
                          </Text>
                          <Text className="mt-1 text-center font-body text-sm text-muted-foreground horizontal-desktop:text-base">
                            {getDescription(slide, lang)}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  )
                })}
              </View>

              <Pressable
                onPress={goPrev}
                disabled={isFirst}
                className={cn(
                  'absolute left-1 top-1/2 h-10 w-10 -translate-y-5 items-center justify-center rounded-full border-2 bg-white shadow',
                  isFirst
                    ? 'border-km0-beige-200 text-km0-beige-300 opacity-50'
                    : 'border-km0-yellow-400 text-km0-blue-700'
                )}
              >
                <Text className="text-lg">‹</Text>
              </Pressable>

              <Pressable
                onPress={goNext}
                disabled={isLast}
                className={cn(
                  'absolute right-1 top-1/2 h-10 w-10 -translate-y-5 items-center justify-center rounded-full border-2 bg-white shadow',
                  isLast
                    ? 'border-km0-beige-200 text-km0-beige-300 opacity-50'
                    : 'border-km0-yellow-400 text-km0-blue-700'
                )}
              >
                <Text className="text-lg">›</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            style={footerAnimatedStyle}
            className="absolute bottom-0 left-0 right-0 z-20 w-full"
          >
            <View className="gap-2 border-t border-km0-beige-200/80 bg-white/40 px-4 py-2">
              <View className="flex-row items-center justify-center gap-2">
                {onboarding.slides.map((slide, index) => (
                  <Pressable
                    key={`thumb-land-${slide.id}`}
                    onPress={() => goTo(index)}
                    className={cn(
                      'h-9 w-9 items-center justify-center rounded-xl border-2',
                      index === current
                        ? 'border-km0-yellow-500 bg-km0-yellow-100'
                        : 'border-km0-beige-300 bg-km0-beige-50'
                    )}
                  >
                    <Text className="text-sm">{slide.emoji}</Text>
                  </Pressable>
                ))}
              </View>

              <View className="flex-row items-center justify-between">
              <Text className="font-ui text-sm font-bold text-primary">
                {current + 1}/{total}
              </Text>
              <View className="flex-row items-center gap-2">
                {onboarding.slides.map((slide, index) => (
                  <Pressable
                    key={`dot-land-${slide.id}`}
                    onPress={() => goTo(index)}
                    className={cn(
                      'rounded-full',
                      index === current
                        ? 'h-3 w-3 bg-km0-yellow-500'
                        : 'h-2 w-2 bg-km0-blue-200'
                    )}
                  />
                ))}
              </View>
              <Pressable
                onPress={() => {
                  if (!isLast) {
                    goTo(total - 1)
                  }
                }}
                className="rounded-2xl bg-primary px-4 py-2"
              >
                <Text className="font-ui text-xs font-semibold text-white">
                  {skipLabel}
                </Text>
              </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Animated.View>
  )
}
