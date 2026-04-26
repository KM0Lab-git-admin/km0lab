import { Text } from '@km0lab/ui'
import { cn } from '@km0lab/ui/lib/utils'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { SafeAreaView, View } from 'react-native'

import FlagCa from '../assets/images/flags/flag-ca.svg'
import FlagEn from '../assets/images/flags/flag-en.svg'
import FlagEs from '../assets/images/flags/flag-es.svg'
import { FloatingDots } from '../components/LanguageSelection/FloatingDots'
import { Km0Logo } from '../components/LanguageSelection/Km0Logo'
import { LanguageCard } from '../components/LanguageSelection/LanguageCard'

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
    <SafeAreaView className="language-screen-root h-screen min-h-screen w-screen flex-1 bg-background web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 horizontal-mobile:items-center horizontal-mobile:justify-center horizontal-mobile:p-2 horizontal-desktop:items-center horizontal-desktop:justify-center horizontal-desktop:p-4">
      <View className="w-full flex-1 flex-col items-center px-4 pb-6 pt-4 vertical-mobile:pb-4 vertical-mobile:pt-2 vertical-tablet:pt-6 horizontal-mobile:hidden horizontal-desktop:hidden">
        <View className="w-full shrink-0 items-center justify-center">
          <Km0Logo width={210} height={38} />
        </View>

        <View className="w-full max-w-language-content flex-col items-stretch vertical-tablet:max-w-language-content-sm">
          <View className="mt-portrait-visual-offset items-center justify-center vertical-mobile:mt-4">
            <View className="relative h-language-visual w-language-visual items-center justify-center vertical-mobile:h-52 vertical-mobile:w-52 vertical-tablet:h-language-visual-sm vertical-tablet:w-language-visual-sm">
              <FloatingDots />

              <View className="relative h-language-ring w-language-ring items-center justify-center vertical-mobile:h-44 vertical-mobile:w-44 vertical-tablet:h-language-ring-sm vertical-tablet:w-language-ring-sm">
                <View className="absolute inset-0 rounded-full border-2 border-km0-blue-700 bg-km0-teal-400/25" />
                <View className="absolute inset-ring-inner rounded-full bg-km0-teal-500/90" />
                <View
                  className="language-robot-image z-10 h-language-robot w-language-robot animate-float vertical-mobile:h-32 vertical-mobile:w-32 vertical-tablet:h-language-robot-sm vertical-tablet:w-language-robot-sm web:drop-shadow-lg"
                  accessibilityRole="image"
                  accessibilityLabel="KM0 LAB mascot"
                />
              </View>
            </View>
          </View>

          <Text className="mt-portrait-title-offset text-center font-ui text-base font-semibold text-km0-blue-700 vertical-mobile:mt-8 vertical-tablet:text-xl">
            Escoge tu idioma
          </Text>

          <View className="mt-portrait-cards-offset gap-3 vertical-mobile:mt-7 vertical-mobile:gap-4 vertical-tablet:gap-4">
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
      </View>

      <View className="language-landscape-card hidden flex-col overflow-hidden rounded-3xl border-2 border-km0-blue-700/80 bg-background web:mx-auto web:bg-gradient-to-b web:from-km0-beige-50 web:to-km0-beige-100 web:shadow-km0-landscape horizontal-mobile:flex horizontal-desktop:flex">
        <View className="shrink-0 items-center justify-center pb-4 pt-5 horizontal-mobile:scale-82 horizontal-mobile:pb-2 horizontal-mobile:pt-3">
          <Km0Logo width={242} height={44} />
        </View>

        <View className="min-h-0 flex-1 flex-row items-stretch px-6 pb-6 horizontal-mobile:px-4 horizontal-mobile:pb-3">
          <View className="relative flex-1 items-center justify-center pr-6 horizontal-mobile:pr-4">
            <FloatingDots />

            <View className="relative h-language-ring-landscape w-language-ring-landscape items-center justify-center horizontal-mobile:h-language-ring-horizontal-mobile horizontal-mobile:w-language-ring-horizontal-mobile horizontal-desktop:h-language-ring-landscape-wide horizontal-desktop:w-language-ring-landscape-wide">
              <View className="absolute inset-0 rounded-full border-2 border-km0-blue-700 bg-km0-teal-400/25" />
              <View className="absolute inset-ring-inner rounded-full bg-km0-teal-500/90" />
              <View
                className="language-robot-image z-10 h-language-robot-landscape w-language-robot-landscape animate-float horizontal-mobile:h-language-robot-horizontal-mobile horizontal-mobile:w-language-robot-horizontal-mobile horizontal-desktop:h-language-robot-landscape-wide horizontal-desktop:w-language-robot-landscape-wide web:drop-shadow-lg"
                accessibilityRole="image"
                accessibilityLabel="KM0 LAB mascot"
              />
            </View>
          </View>

          <View className="mx-2 w-px self-stretch bg-km0-yellow-500/60 horizontal-mobile:mx-1" />

          <View className="flex-1 justify-center gap-3 pl-6 horizontal-mobile:gap-2 horizontal-mobile:pl-4">
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
      </View>
    </SafeAreaView>
  )
}
