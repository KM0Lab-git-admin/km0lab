import { cn } from '@km0lab/ui/lib/utils'
import * as React from 'react'
import { TextInput } from 'react-native'


import type { TextInputProps } from 'react-native'

function Textarea({
  className,
  multiline = true,
  numberOfLines = 4,
  placeholderClassName,
  ...props
}: TextInputProps & {
  ref?: React.Ref<TextInput>
}) {
  return (
    <TextInput
      className={cn(
        'bg-background web:flex border-input text-foreground placeholder:text-placeholder min-h-textarea w-full border-b p-2 text-sm',
        'file:font-sans-medium file:border-0 file:bg-transparent',
        'web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        props.value && 'border-primary bg-background',
        props.editable === false &&
          'web:cursor-not-allowed text-placeholder bg-accent border-input',
        className
      )}
      placeholderClassName={cn('text-placeholder', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  )
}

export { Textarea }
