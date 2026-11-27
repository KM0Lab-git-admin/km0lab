import {
  pendingScanStep,
  scannerPathFor,
  useAppStore,
  useAuth,
} from '@km0lab/app'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Retoma el escaneo que quedó pendiente al abrir el enlace de un comercio
 * sin sesión o sin haber usado nunca la app (ver `utils/pendingScan`).
 *
 * No pinta nada. Cuando el vecino ya tiene idioma y código postal:
 * - sin sesión, lo lleva a entrar una sola vez (si se va, no se insiste);
 * - con sesión, abre el escáner con el código guardado, que suma los puntos.
 */
export default function ResumePendingScan() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { session, loading } = useAuth()
  const pending = useAppStore((s) => s.pendingScan)
  const setPendingScan = useAppStore((s) => s.setPendingScan)
  const langChosen = useAppStore((s) => s.langChosen)
  const postalCode = useAppStore((s) => s.postalCode)
  const [hydrated, setHydrated] = useState(() =>
    useAppStore.persist.hasHydrated()
  )
  /** Código por el que ya se le llevó a entrar. */
  const prompted = useRef<string | null>(null)

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAppStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    const step = pendingScanStep({
      pending,
      now: Date.now(),
      ready: hydrated && !loading,
      setupDone: langChosen && !!postalCode,
      hasSession: !!session,
      pathname,
      loginPrompted: !!pending && prompted.current === pending.code,
    })
    if (step === 'expired') {
      setPendingScan(null)
      return
    }
    if (!pending) return
    const target = scannerPathFor(pending.code)
    if (step === 'resume') {
      navigate(target, { replace: true })
    } else if (step === 'login') {
      prompted.current = pending.code
      navigate(`/login?returnTo=${encodeURIComponent(target)}`, {
        replace: true,
      })
    }
  }, [
    pending,
    hydrated,
    loading,
    langChosen,
    postalCode,
    session,
    pathname,
    navigate,
    setPendingScan,
  ])

  return null
}
