import { cn } from '@km0lab/ui/lib/utils'
import { View } from 'react-native'


import { Text } from './text'

import type { TextProps, ViewProps } from 'react-native'

function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'border-border bg-card rounded-2xl border p-4 shadow-sm',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('flex flex-col gap-1.5', className)} {...props} />
}

function CardTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('font-sans-medium text-card-foreground text-lg', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('gap-2', className)} {...props} />
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-row flex-wrap items-center gap-2 pt-4', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}
