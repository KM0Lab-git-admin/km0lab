import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@km0lab/app'

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

  // Preview: `/home-registered` deja pasar sin sesión real para poder
  // navegar por Els meus punts, Premis canjats y Perfil desde la demo.
  // En desarrollo (import.meta.env.DEV) también se salta el guard para
  // poder validar pantallas protegidas sin loguearse.
  const previewAuthed =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('km0_preview_authed') === '1'

  if (!session && !previewAuthed && !import.meta.env.DEV) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default RequireAuth
