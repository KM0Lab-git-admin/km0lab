import { t, useAppStore } from '@km0lab/app'

import type { ReactNode } from 'react'

import { useLang } from '@/contexts/LangContext'

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
 *
 * En la demostración (se entra tecleando 00000) enseña arriba la marca
 * «Demostració», igual que `BrandedFrame` (commit 93cd73f de Lovable).
 */
interface DeviceShellProps {
  children: ReactNode
}

const DeviceShell = ({ children }: DeviceShellProps) => {
  const { lang } = useLang()
  const isShowcase = useAppStore((s) => s.isShowcase)
  return (
    <div className="device-shell safe-area-inset">
      <div className="device-frame">
        {isShowcase && (
          <span className="pointer-events-none absolute left-1/2 top-1 z-30 -translate-x-1/2 rounded-full bg-muted/90 px-2 py-0.5 font-ui text-[10px] font-semibold leading-none text-muted-foreground">
            {t('demo.badge', lang)}
          </span>
        )}
        {children}
      </div>
    </div>
  )
}

export default DeviceShell
