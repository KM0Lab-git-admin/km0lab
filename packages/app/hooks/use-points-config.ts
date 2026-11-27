import { useEffect, useState } from 'react'

import { listPublicActions } from '../services/points'
import { getPublicTown } from '../services/towns'
import { useAppStore } from '../stores/useAppStore'
import { isDemoPostalCode } from '../utils/demoTown'

export interface PointsConfig {
  signup: number
  scan: number
}

/** Valores por defecto del servidor mientras llega la respuesta del municipio. */
const SERVER_DEFAULTS: PointsConfig = { signup: 100, scan: 10 }

/**
 * usePointsConfig — puntos que el municipio da por registrarse y por
 * escanear el QR de un comercio.
 *
 * Costura con Lovable. Sale de km0lab-api: el escaneo de
 * `GET /towns/public` (`default_visit_points`, que es lo que abona
 * `POST /scans`) y el registro de `GET /actions/public`.
 */
export function usePointsConfig(): PointsConfig {
  const postalCode = useAppStore((s) => s.postalCode)
  const [config, setConfig] = useState<PointsConfig>(SERVER_DEFAULTS)

  useEffect(() => {
    if (!postalCode) return
    let cancelled = false
    const demo = isDemoPostalCode(postalCode)
    Promise.all([
      getPublicTown(postalCode),
      listPublicActions(postalCode, { demo }),
    ])
      .then(([town, actions]) => {
        if (cancelled) return
        const pointsOf = (type: string, fallback: number) =>
          actions.find((a) => a.type === type && a.active)?.points ?? fallback
        setConfig({
          signup: pointsOf('signup', SERVER_DEFAULTS.signup),
          scan: town.default_visit_points,
        })
      })
      .catch(() => {
        /* se mantienen los valores por defecto del servidor */
      })
    return () => {
      cancelled = true
    }
  }, [postalCode])

  return config
}
