import { Capacitor } from '@capacitor/core'

import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'

/**
 * DeviceShell — Marco "teléfono" reutilizable SIN header de marca.
 *
 * KM0 LAB es una app mobile-first (Capacitor). En web se presenta como un
 * teléfono centrado con borde azul (útil para maquetar en desktop). En
 * nativo (Android/iOS) el chrome desaparece y el contenido ocupa el
 * viewport del dispositivo (altura fija + safe-area) para que el scroll
 * interno de cada pantalla no arrastre cabeceras fijas.
 *
 * El contenido recibe 100% del alto/ancho del frame y gestiona su propio
 * scroll interno si lo necesita.
 */
interface DeviceShellProps {
  children: ReactNode
}

/** Marco "teléfono" solo en web; en nativo ocupa el viewport real. */
const showDeviceChrome = !Capacitor.isNativePlatform()

const DeviceShell = ({ children }: DeviceShellProps) => {
  return (
    <div
      className={cn(
        'w-full bg-gradient-to-b from-km0-beige-50 to-km0-beige-100 overflow-hidden',
        showDeviceChrome
          ? 'flex min-h-dvh items-center justify-center p-0'
          : 'flex h-dvh max-h-dvh flex-col safe-area-inset'
      )}
    >
      <div
        className={cn(
          'relative flex flex-col bg-km0-beige-50 overflow-hidden',
          showDeviceChrome
            ? 'rounded-3xl border-2 border-km0-blue-700/80 shadow-device-frame'
            : 'min-h-0 w-full flex-1 rounded-none border-0 shadow-none'
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
