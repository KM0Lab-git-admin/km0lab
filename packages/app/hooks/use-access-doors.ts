import { useEffect, useState } from 'react'

import { getAuthProviders } from '../services/socialAccess'

import type { AccessProvider } from '../types/access'

/**
 * Las redes que se ofrecen en esta plataforma, ya ordenadas.
 *
 * De producción (candado en el manifest). El prototipo las lee de la
 * dirección (`?providers=`); aquí las dice el servidor (`GET /auth/providers`)
 * según la plataforma que manda la App. Mientras no contesta, y si falla,
 * ninguna: queda el correo, que siempre funciona.
 */
export const useAccessDoors = (): { providers: AccessProvider[] } => {
  const [providers, setProviders] = useState<AccessProvider[]>([])
  useEffect(() => {
    let alive = true
    void getAuthProviders().then((list) => {
      if (alive) setProviders(list.map((p) => p.provider))
    })
    return () => {
      alive = false
    }
  }, [])
  return { providers }
}
