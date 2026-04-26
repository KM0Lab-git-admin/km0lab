import { Text } from '@km0lab/ui'
import { cn } from '@km0lab/ui/lib/utils'
import { Pressable, View } from 'react-native'

import type { ComponentType } from 'react'
import type { SvgProps } from 'react-native-svg'

type LanguageCardProps = {
  Flag: ComponentType<SvgProps>
  name: string
  description: string
  selected?: boolean
  disabled?: boolean
  onPress?: () => void
  className?: string
}

export function LanguageCard({
  Flag,
  name,
  description,
  selected = false,
  disabled = false,
  onPress,
  className,
}: LanguageCardProps) {
  return (
    <Pressable
      className={cn(
        'language-card w-full animate-fade-in-up flex-row items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left',
        'transition-all duration-300 ease-out',
        'vertical-mobile:px-4 vertical-mobile:py-4 vertical-tablet:px-5 vertical-tablet:py-5 horizontal-mobile:px-3 horizontal-mobile:py-2 horizontal-desktop:px-4 horizontal-desktop:py-3',
        disabled
          ? 'border-neutral-300 bg-neutral-100 web:cursor-not-allowed'
          : cn(
              'border-km0-blue-700 bg-card web:cursor-pointer web:shadow-km0-card',
              'web:hover:-translate-y-3 web:hover:scale-109 web:hover:border-km0-yellow-500 web:hover:bg-km0-yellow-50 web:hover:shadow-km0-card-hover',
              selected &&
                'border-km0-yellow-500 bg-km0-yellow-50 web:-translate-y-1.5 web:scale-104 web:shadow-km0-card-selected'
            ),
        className
      )}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      onPress={disabled ? undefined : onPress}
    >
      <View
        className={cn(
          'language-card-flag h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full transition-all duration-300',
          'vertical-mobile:h-11 vertical-mobile:w-11 vertical-tablet:h-14 vertical-tablet:w-14 horizontal-mobile:h-9 horizontal-mobile:w-9 horizontal-desktop:h-11 horizontal-desktop:w-11',
          disabled
            ? 'bg-neutral-200 web:grayscale'
            : selected
              ? 'bg-km0-yellow-100 web:scale-110'
              : 'bg-km0-beige-50 web:hover:bg-km0-yellow-100 web:hover:scale-110'
        )}
      >
        <Flag width={36} height={36} />
      </View>

      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            'language-card-title font-ui text-lg font-semibold leading-tight',
            'vertical-tablet:text-xl horizontal-mobile:text-base horizontal-desktop:text-lg',
            disabled ? 'text-neutral-500' : 'text-primary'
          )}
        >
          {name}
        </Text>
        <Text
          className={cn(
            'language-card-description mt-0.5 font-body text-sm',
            'vertical-tablet:text-base horizontal-mobile:text-xs horizontal-desktop:text-sm',
            disabled ? 'text-neutral-500' : 'text-muted-foreground'
          )}
        >
          {description}
        </Text>
      </View>

      <Text
        className={cn(
          'flex-shrink-0 text-xl transition-all duration-300',
          disabled
            ? 'text-neutral-500'
            : selected
              ? 'text-km0-yellow-500 web:translate-x-1'
              : 'text-km0-blue-300 web:hover:text-km0-yellow-500'
        )}
      >
        →
      </Text>
    </Pressable>
  )
}
