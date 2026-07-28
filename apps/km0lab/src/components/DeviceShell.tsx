import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * DeviceShell — Marco "teléfono" reutilizable SIN header de marca.
 *
 * KM0 LAB es una app mobile-first (Capacitor). Se presenta como un
 * teléfono centrado con borde azul en todos los entornos (local, UAT,
 * producción), útil para maquetar en desktop y alinear con la maqueta.
 *
 * El contenido recibe 100% del alto/ancho del frame y gestiona su propio
 * scroll interno si lo necesita.
 */
interface DeviceShellProps {
  children: ReactNode
}

const DeviceShell = ({ children }: DeviceShellProps) => {
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 overflow-hidden flex items-center justify-center p-0">
      <div
        className={cn(
          'relative flex flex-col bg-km0-beige-50 overflow-hidden',
          'rounded-3xl border-2 border-km0-blue-700/80 shadow-device-frame'
        )}
        style={{
          width: 'min(100vw, 420px)',
          height:
            'min(calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)), 920px)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default DeviceShell
