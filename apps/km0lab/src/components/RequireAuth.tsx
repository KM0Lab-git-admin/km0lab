import { useAuth } from '@km0lab/app'
import { Navigate, useLocation } from 'react-router-dom'

import type { ReactNode } from 'react'

/**
 * RequireAuth — Guard para rutas privadas.
 * Si no hay sesión, redirige a /login conservando la ruta original
 * en `state.from` para volver tras el login.
 */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // Loading silencioso — TopLoadingBar ya cubre la transición visual.
    return null
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default RequireAuth
