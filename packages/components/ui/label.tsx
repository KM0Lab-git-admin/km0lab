import { cn } from '@km0lab/ui/lib/utils'
import * as LabelPrimitive from '@rn-primitives/label'
import * as React from 'react'


const Label = ({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  ref,
  ...props
}: LabelPrimitive.TextProps & {
  ref?: React.Ref<LabelPrimitive.TextRef>
}) => (
  <LabelPrimitive.Root
    className="web:cursor-default"
    onPress={onPress}
    onLongPress={onLongPress}
    onPressIn={onPressIn}
    onPressOut={onPressOut}
  >
    <LabelPrimitive.Text
      ref={ref}
      className={cn(
        'text-primary web:peer-disabled:cursor-not-allowed web:bg-background bg-transparent text-xs leading-none',
        className
      )}
      {...props}
    />
  </LabelPrimitive.Root>
)

export { Label }
