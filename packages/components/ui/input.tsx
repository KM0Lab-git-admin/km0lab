import { cn } from '@km0lab/ui/lib/utils'
import * as React from 'react'
import { TextInput } from 'react-native'


import type { TextInputProps } from 'react-native'

type InputProps = {
  className?: string
  placeholderClassName?: string
  ref?: React.Ref<TextInput>
} & Omit<TextInputProps, 'className' | 'ref'>

function Input({ className, placeholderClassName, ref, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        'bg-background web:flex web:w-full border-input text-foreground placeholder:text-placeholder h-10 border-b p-2 text-sm leading-tight',
        'file:font-sans-medium file:border-0 file:bg-transparent',
        'web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        'web:disabled:text-placeholder web:disabled:bg-accent',
        props.value && 'border-primary bg-background',
        props.editable === false &&
          'web:cursor-not-allowed text-placeholder bg-accent border-input',
        className
      )}
      placeholderClassName={cn('text-placeholder', placeholderClassName)}
      ref={ref}
      {...props}
    />
  )
}

export { Input }
