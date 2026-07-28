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

  // Preview: `/home-registrado` deja pasar sin sesión real para poder
  // navegar por Els meus punts, Premis canjats y Perfil desde la demo.
  const previewAuthed =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('km0_preview_authed') === '1'

  if (!session && !previewAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default RequireAuth
