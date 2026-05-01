import { Text } from '@km0lab/ui'
import { cn } from '@km0lab/ui/lib/utils'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Image, View } from 'react-native'

import FlagCa from '../../assets/images/flags/flag-ca.svg'
import FlagEn from '../../assets/images/flags/flag-en.svg'
import FlagEs from '../../assets/images/flags/flag-es.svg'
import { BrandedFrame } from '../../components/BrandedFrame'
import { FloatingDots } from '../../components/FloatingDots'
import { LanguageCard } from '../../components/LanguageCard'

const ROBOT_IMAGE = require('../../assets/images/km0-robot.png')

const LANGUAGES = [
  {
    id: 'ca',
    Flag: FlagCa,
    name: 'Català',
    description: 'Comença en català',
    disabled: false,
  },
  {
    id: 'es',
    Flag: FlagEs,
    name: 'Español',
    description: 'Empieza en español',
    disabled: false,
  },
  {
    id: 'en',
    Flag: FlagEn,
    name: 'English',
    description: 'Start in English',
    disabled: true,
  },
] as const

type LanguageId = (typeof LANGUAGES)[number]['id']

export default function LanguageSelectionScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<LanguageId | null>(null)

  function handleSelect(id: LanguageId) {
    setSelected(id)
    setTimeout(() => {
      router.push({
        pathname: '/onboarding',
        params: { lang: id },
      })
    }, 300)
  }

  return (
    <BrandedFrame>
      {/* ── PORTRAIT body (vertical-mobile + vertical-tablet) ─── */}
      <View className="mx-auto w-full max-w-language-content flex-1 flex-col items-stretch justify-start gap-4 pb-4 pt-2 vertical-tablet:max-w-language-content-sm vertical-tablet:gap-6 vertical-tablet:py-4 horizontal-mobile:hidden horizontal-desktop:hidden">
        {/* Robot ilustración */}
        <View className="shrink-0 items-center">
          <View className="relative h-language-visual w-language-visual items-center justify-center vertical-tablet:h-language-visual-sm vertical-tablet:w-language-visual-sm">
            <FloatingDots />
            <View className="relative h-language-ring w-language-ring items-center justify-center vertical-tablet:h-language-ring-sm vertical-tablet:w-language-ring-sm">
              <View className="absolute inset-0 rounded-full border-2 border-km0-blue-700 bg-km0-teal-400/25" />
              <View className="absolute inset-ring-inner rounded-full bg-km0-teal-500/90" />
              <Image
                source={ROBOT_IMAGE}
                resizeMode="contain"
                accessibilityLabel="KM0 LAB mascot"
                className="z-10 h-language-robot w-language-robot animate-float vertical-tablet:h-language-robot-sm vertical-tablet:w-language-robot-sm web:drop-shadow-lg"
              />
            </View>
          </View>
        </View>

        <Text className="shrink-0 text-center font-ui text-base font-semibold text-km0-blue-700 vertical-tablet:text-xl">
          Escoge tu idioma
        </Text>

        {/* Lista de idiomas (LanguageCard ya tiene los breakpoints internos) */}
        <View className="shrink-0 flex-col gap-2 vertical-tablet:gap-4">
          {LANGUAGES.map((lang, index) => (
            <LanguageCard
              key={lang.id}
              Flag={lang.Flag}
              name={lang.name}
              description={lang.description}
              disabled={lang.disabled}
              selected={selected === lang.id}
              className={cn(
                index === 0 && 'web:animate-delay-none',
                index === 1 && 'web:animate-delay-card-1',
                index === 2 && 'web:animate-delay-card-2'
              )}
              onPress={() => handleSelect(lang.id)}
            />
          ))}
        </View>
      </View>

      {/* ── LANDSCAPE body (horizontal-mobile + horizontal-desktop) ─ */}
      <View className="hidden w-full flex-1 flex-row items-stretch horizontal-mobile:flex horizontal-desktop:flex">
        {/* Columna izquierda: ilustración */}
        <View className="relative flex-1 items-center justify-center pr-6 horizontal-mobile:pr-4">
          <FloatingDots />
          <View className="relative h-language-ring-landscape w-language-ring-landscape items-center justify-center horizontal-mobile:h-language-ring-horizontal-mobile horizontal-mobile:w-language-ring-horizontal-mobile horizontal-desktop:h-language-ring-landscape-wide horizontal-desktop:w-language-ring-landscape-wide">
            <View className="absolute inset-0 rounded-full border-2 border-km0-blue-700 bg-km0-teal-400/25" />
            <View className="absolute inset-ring-inner rounded-full bg-km0-teal-500/90" />
            <Image
              source={ROBOT_IMAGE}
              resizeMode="contain"
              accessibilityLabel="KM0 LAB mascot"
              className="z-10 h-language-robot-landscape w-language-robot-landscape animate-float horizontal-mobile:h-language-robot-horizontal-mobile horizontal-mobile:w-language-robot-horizontal-mobile horizontal-desktop:h-language-robot-landscape-wide horizontal-desktop:w-language-robot-landscape-wide web:drop-shadow-lg"
            />
          </View>
        </View>

        {/* Divisor */}
        <View className="mx-2 w-px self-stretch bg-km0-yellow-500/60 horizontal-mobile:mx-1" />

        {/* Columna derecha: tarjetas */}
        <View className="flex-1 flex-col justify-center gap-3 pl-6 horizontal-mobile:gap-2 horizontal-mobile:pl-4">
          {LANGUAGES.map((lang, index) => (
            <LanguageCard
              key={lang.id}
              Flag={lang.Flag}
              name={lang.name}
              description={lang.description}
              disabled={lang.disabled}
              selected={selected === lang.id}
              className={cn(
                index === 0 && 'web:animate-delay-none',
                index === 1 && 'web:animate-delay-card-1',
                index === 2 && 'web:animate-delay-card-2'
              )}
              onPress={() => handleSelect(lang.id)}
            />
          ))}
        </View>
      </View>
    </BrandedFrame>
  )
}
