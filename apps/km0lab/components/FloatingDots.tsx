import { cn } from '@km0lab/ui/lib/utils'
import { View } from 'react-native'

const DOTS = [
  'h-dot-10 w-dot-10 top-dot-top-10 left-dot-left-8 opacity-70 animate-float',
  'h-dot-7 w-dot-7 top-dot-top-25 left-dot-left-88 opacity-50 animate-float-slow web:animate-delay-card-1',
  'h-dot-12 w-dot-12 top-dot-top-60 left-dot-left-5 opacity-60 animate-float-slower web:animate-delay-card-2',
  'h-dot-6 w-dot-6 top-dot-top-75 left-dot-left-90 opacity-40 animate-float-slowest',
  'h-dot-9 w-dot-9 top-dot-top-45 left-dot-left-92 opacity-55 animate-float-slow',
  'h-dot-8 w-dot-8 top-dot-top-5 left-dot-left-70 opacity-45 animate-float-slower',
] as const

type FloatingDotsProps = {
  className?: string
}

export function FloatingDots({ className }: FloatingDotsProps) {
  return (
    <View className={cn('pointer-events-none absolute inset-0', className)}>
      {DOTS.map((dotClassName) => (
        <View
          key={dotClassName}
          className={cn('absolute rounded-full bg-km0-teal-500', dotClassName)}
        />
      ))}
    </View>
  )
}
