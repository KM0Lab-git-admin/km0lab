import { IconClassContext } from '@km0lab/ui/icons/icon-context'
import { cn } from '@km0lab/ui/lib/utils'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { Pressable } from 'react-native'


import { TextClassContext } from './text'

import type { VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  cn(
    'group flex flex-row items-center justify-center',
    'web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2'
  ),
  {
    variants: {
      variant: {
        primary:
          'bg-primary web:hover:enabled:bg-primary-active active:bg-primary-active',
        secondary:
          'bg-secondary web:hover:enabled:bg-secondary-active active:bg-secondary-active',
        'outline-primary':
          'border-2 border-primary bg-background web:hover:enabled:bg-primary-subtle active:bg-primary-subtle',
        'outline-secondary':
          'border-2 border-secondary bg-background web:hover:enabled:bg-secondary-subtle active:bg-secondary-subtle',
        'ghost-primary':
          'web:hover:enabled:bg-primary-subtle active:bg-primary-subtle',
        'ghost-secondary':
          'web:hover:enabled:bg-secondary-subtle active:bg-secondary-subtle',
        'link-primary':
          'web:underline-offset-4 web:decoration-primary web:hover:enabled:underline web:focus:underline',
        'link-secondary':
          'web:underline-offset-4 web:decoration-secondary web:hover:enabled:underline web:focus:underline',
        destructive:
          'border-2 border-destructive-foreground bg-destructive web:hover:enabled:bg-destructive-subtle active:bg-destructive-subtle',
      },
      size: {
        default: 'h-10 px-3 py-2 gap-2',
        xs: 'h-5 p-0 gap-2 gap-1',
        sm: 'h-9 px-3 py-1.5 gap-2',
        lg: 'h-12 px-4 gap-2',
        icon: 'h-10 web:h-8 p-1 w-10 web:w-8',
        'icon-sm': 'h-9 p-1 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

const buttonTextVariants = cva(
  'web:whitespace-nowrap web:truncate text-base font-sans-medium text-foreground web:transition-colors',
  {
    variants: {
      variant: {
        primary: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        'outline-primary': 'text-primary',
        'outline-secondary': 'text-secondary',
        'ghost-primary': 'text-primary',
        'ghost-secondary': 'text-secondary',
        'link-primary': 'normal-case text-primary group-active:underline',
        'link-secondary': 'normal-case text-secondary group-active:underline',
        destructive: 'text-destructive-foreground',
      },
      size: {
        default: 'text-base',
        xs: 'text-sm',
        sm: 'text-sm',
        lg: 'text-lg',
        icon: 'text-sm',
        'icon-sm': 'text-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

const buttonIconVariants = cva('text-foreground', {
  variants: {
    variant: {
      primary: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      'outline-primary': 'text-primary',
      'outline-secondary': 'text-secondary',
      'ghost-primary': 'text-primary',
      'ghost-secondary': 'text-secondary',
      'link-primary': 'text-primary',
      'link-secondary': 'text-secondary',
      destructive: 'text-destructive-foreground',
    },
    size: {
      default: 'h-6 w-6',
      xs: 'h-6 w-6',
      sm: 'h-6 w-6',
      lg: 'h-6 w-6',
      icon: 'h-6 w-6',
      'icon-sm': 'h-6 w-6',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
})

type ButtonProps = React.CustomComponentPropsWithRef<typeof Pressable> &
  VariantProps<typeof buttonVariants>

function Button({ ref, className, variant, size, ...props }: ButtonProps) {
  return (
    <IconClassContext.Provider
      value={cn(
        props.disabled && 'web:pointer-events-none',
        buttonIconVariants({ variant, size })
      )}
    >
      <TextClassContext.Provider
        value={cn(
          props.disabled && 'web:pointer-events-none',
          buttonTextVariants({ variant, size })
        )}
      >
        <Pressable
          className={cn(
            props.disabled && 'web:pointer-events-none opacity-50',
            buttonVariants({ variant, size, className })
          )}
          ref={ref}
          role="button"
          {...props}
        />
      </TextClassContext.Provider>
    </IconClassContext.Provider>
  )
}

export { Button, buttonTextVariants, buttonVariants, buttonIconVariants }
export type { ButtonProps }
