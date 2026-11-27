import { scannerPathFor, useAppStore } from '@km0lab/app'
import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

/**
 * ScanDeepLink — destino de los QR impresos (`https://app.km0lab.com/scan?c=…`).
 *
 * Guarda el código y manda al escáner. Si el vecino no tiene sesión, o no ha
 * usado nunca la app, las guardas de `/scanner` lo llevan a idioma, código
 * postal o registro; al terminar, `ResumePendingScan` retoma el escaneo con
 * el código guardado. Por eso esta ruta no lleva guardas: el código tiene
 * que guardarse antes de que nada redirija.
 */
const ScanDeepLink = () => {
  const [params] = useSearchParams()
  const c = params.get('c')
  const setPendingScan = useAppStore((s) => s.setPendingScan)
  const [stored, setStored] = useState(false)

  useEffect(() => {
    if (c) setPendingScan({ code: c, at: Date.now() })
    setStored(true)
  }, [c, setPendingScan])

  if (!stored) return null
  return <Navigate to={c ? scannerPathFor(c) : '/scanner'} replace />
}

export default ScanDeepLink
