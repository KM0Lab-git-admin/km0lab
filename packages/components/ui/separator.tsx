import { cn } from '@km0lab/ui/lib/utils'
import * as SeparatorPrimitive from '@rn-primitives/separator'
import * as React from 'react'


const Separator = ({
  className,
  orientation = 'horizontal',
  decorative = true,
  ref,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'bg-border shrink-0',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
)

export { Separator }
