import type { ReactNode } from 'react'

/**
 * DeviceShell — Marco "teléfono" reutilizable SIN header de marca.
 *
 * KM0 LAB es una app mobile-first (Capacitor). En todas las anchuras se
 * presenta como un teléfono en vertical, centrado sobre el fondo de la
 * página: en móvil ocupa la pantalla; en tablet/landscape/desktop queda
 * como un teléfono centrado con el fondo alrededor. NO hay layout de
 * escritorio propio (decisión: desktop es superficie secundaria; ver
 * docs/LOVABLE-KNOWLEDGE.md §3, regla de layout portrait-first).
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
      {/* Teléfono en vertical, centrado en cualquier anchura. En móvil
          llena la pantalla; en pantallas anchas queda centrado. */}
      <div
        className="relative flex flex-col bg-km0-beige-50 rounded-3xl border-2 border-km0-blue-700/80 shadow-[0_24px_60px_-20px_hsl(var(--km0-blue-700)/0.3)] overflow-hidden"
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
