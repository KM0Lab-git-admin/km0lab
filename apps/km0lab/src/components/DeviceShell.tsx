import type { ReactNode } from 'react'

/**
 * DeviceShell — Marco "teléfono" reutilizable SIN header de marca.
 *
 * KM0 LAB es una app mobile-first (Capacitor). En desktop/tablet web se
 * presenta como un teléfono centrado con borde azul. En móvil web y en
 * nativo (Android/iOS) el halo desaparece y el contenido ocupa el
 * viewport (altura fija + safe-area) para que el scroll interno de cada
 * pantalla no arrastre cabeceras fijas.
 *
 * El contenido recibe 100% del alto/ancho del frame y gestiona su propio
 * scroll interno si lo necesita.
 */
interface DeviceShellProps {
  children: ReactNode
}

const DeviceShell = ({ children }: DeviceShellProps) => {
  return (
    <div className="device-shell safe-area-inset">
      <div className="device-frame">{children}</div>
    </div>
  )
}

export default DeviceShell
