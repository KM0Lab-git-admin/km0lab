import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

/**
 * DeviceShell — Marco "teléfono" reutilizable SIN header de marca.
 *
 * KM0 LAB es una app mobile-first (Capacitor). En desarrollo local se
 * presenta como un teléfono centrado con borde azul (útil para maquetar
 * en desktop). En producción (Vercel / build) el marco desaparece y la
 * app ocupa el viewport a pantalla completa.
 *
 * El contenido recibe 100% del alto/ancho del frame y gestiona su propio
 * scroll interno si lo necesita.
 */
interface DeviceShellProps {
  children: ReactNode
}

/** Solo en Vite dev: borde/sombra del “teléfono”. En Vercel (PROD) no. */
const showDeviceChrome = import.meta.env.DEV

const DeviceShell = ({ children }: DeviceShellProps) => {
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 overflow-hidden flex items-center justify-center p-0">
      <div
        className={cn(
          'relative flex flex-col bg-km0-beige-50 overflow-hidden',
          showDeviceChrome
            ? 'rounded-3xl border-2 border-km0-blue-700/80 shadow-device-frame'
            : 'h-dvh w-full max-w-none rounded-none border-0 shadow-none'
        )}
        style={
          showDeviceChrome
            ? {
                width: 'min(100vw, 420px)',
                height:
                  'min(calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)), 920px)',
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

export default DeviceShell
