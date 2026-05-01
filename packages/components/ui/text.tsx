import * as React from 'react'

import { cn } from '../lib/utils'

/**
 * Text — wrapper neutro para texto.
 *
 * En el legacy RN+NativeWind, Text era el primitivo obligatorio para
 * cualquier string visible. En web no hace falta (usar <p>, <span>,
 * <h*> según semántica), pero mantenemos el componente con un <span>
 * por defecto para que las pantallas portadas desde Lovable no se
 * rompan al importarlo.
 *
 * Para títulos / párrafos / etc. usar HTML semántico directamente.
 */
type TextProps = React.HTMLAttributes<HTMLSpanElement>

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn(className)} {...props} />
  )
)
Text.displayName = 'Text'

export { Text }
