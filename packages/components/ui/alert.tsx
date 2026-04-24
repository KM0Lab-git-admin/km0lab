import { cn } from '@km0lab/ui/lib/utils'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { Text, View } from 'react-native'


import type { Icon } from '@km0lab/ui/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import type { ViewStyle } from 'react-native'

const alertVariants = cva(
  'bg-background relative w-full border p-5 shadow shadow-foreground/10',
  {
    variants: {
      variant: {
        default: 'border-muted-foreground',
        destructive: 'border-destructive',
        success: 'border-success-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Alert({
  children,
  icon: IconComponent,
  className,
  variant,
  style: styleProp,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof View>, 'style'> &
  VariantProps<typeof alertVariants> & {
    icon?: Icon
    style?: ViewStyle
  }) {
  return (
    <View
      role="alert"
      className={cn(
        alertVariants({ variant }),
        !!IconComponent &&
          'ios:pl-alert-icon-inset android:pl-alert-icon-inset web:pl-alert-icon-inset',
        className
      )}
      style={styleProp}
      {...props}
    >
      {!!IconComponent && (
        <View className="native:left-4 native:top-4 absolute left-4 top-4">
          <IconComponent
            className={cn(
              'h-6 w-6 shrink-0',
              variant === 'destructive' && 'text-destructive-foreground',
              variant === 'success' && 'text-success-foreground',
              (!variant || variant === 'default') && 'text-foreground'
            )}
            height={24}
            width={24}
          />
        </View>
      )}
      {children}
    </View>
  )
}

function AlertTitle({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text> & {
  ref?: React.Ref<Text>
}) {
  return (
    <Text
      ref={ref}
      className={cn(
        'text-foreground font-sans-medium mb-1.5 text-xl leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text> & {
  ref?: React.Ref<Text>
}) {
  return (
    <Text
      ref={ref}
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
