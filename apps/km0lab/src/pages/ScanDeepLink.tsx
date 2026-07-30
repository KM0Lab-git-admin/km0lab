import { Navigate, useSearchParams } from 'react-router-dom'

/**
 * ScanDeepLink — destino de los QR impresos (`https://app.km0lab.com/scan?c=…`).
 * Redirige al escáner conservando el token; `/scanner` ya está tras RequireAuth.
 */
const ScanDeepLink = () => {
  const [params] = useSearchParams()
  const c = params.get('c')
  const target = c ? `/scanner?c=${encodeURIComponent(c)}` : '/scanner'
  return <Navigate to={target} replace />
}

export default ScanDeepLink
