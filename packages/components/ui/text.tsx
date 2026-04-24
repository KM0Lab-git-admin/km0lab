import { cn } from '@km0lab/ui/lib/utils'
import * as Slot from '@rn-primitives/slot'
import * as React from 'react'
import { Text as RNText } from 'react-native'


import type { TextProps } from 'react-native'

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  className,
  asChild = false,
  ...props
}: TextProps & {
  className?: string
  ref?: React.Ref<RNText>
  asChild?: boolean
}) {
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot.Text : RNText
  const value = props.children
  const isEmpty = !value || (typeof value === 'string' && value.trim() === '')

  return (
    <Component
      className={cn(
        'text-foreground web:select-text leading-4.5 font-sans text-sm',
        isEmpty && 'text-placeholder font-sans-italic',
        textClass,
        className
      )}
      {...props}
    />
  )
}

export { Text, TextClassContext }
