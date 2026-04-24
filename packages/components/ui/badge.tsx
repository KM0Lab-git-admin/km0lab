import { cn } from '@km0lab/ui/lib/utils'
import * as Slot from '@rn-primitives/slot'
import { cva } from 'class-variance-authority'
import { View } from 'react-native'


import { TextClassContext } from './text'

import type { SlottableViewProps } from '@rn-primitives/types'
import type { VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'web:inline-flex items-center h-7 justify-center border border-border px-2.5 py-0.5 web:transition-colors web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary',
        secondary: 'border-transparent bg-secondary',
        warning: 'border-transparent bg-warning',
        success: 'border-transparent bg-success',
        destructive: 'border-transparent bg-destructive',
        info: 'border-transparent bg-info',
        accent: 'border-transparent bg-accent',
        outline: 'text-foreground',
        purple: 'border-transparent bg-purple',
        'primary-muted': 'border-transparent bg-primary-accent-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const badgeTextVariants = cva('text-xs text-center font-sans-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      warning: 'text-warning-foreground',
      success: 'text-success-foreground',
      destructive: 'text-destructive-foreground',
      info: 'text-info-foreground',
      accent: 'text-accent-foreground',
      outline: 'text-foreground',
      purple: 'text-purple-foreground',
      'primary-muted': 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const badgeIconVariants = cva('', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      warning: 'text-warning-foreground',
      success: 'text-success-foreground',
      destructive: 'text-destructive-foreground',
      info: 'text-info-foreground',
      accent: 'text-accent-foreground',
      outline: 'text-foreground',
      purple: 'text-purple-foreground',
      'primary-muted': 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type BadgeProps = SlottableViewProps & VariantProps<typeof badgeVariants>
type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot.View : View
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

export { Badge, badgeVariants, badgeIconVariants, badgeTextVariants }
export type { BadgeProps, BadgeVariant }
