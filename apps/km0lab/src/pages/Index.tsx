/**
 * Index = punto de entrada de la ruta "/".
 *
 * - Sin idioma explícito → pantalla Language.
 * - Con idioma y sin CP → onboarding.
 * - Con idioma + CP → home.
 */
import { useAppStore } from '@km0lab/app'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import Language from './Language'

const Index = () => {
  const langChosen = useAppStore((s) => s.langChosen)
  const postalCode = useAppStore((s) => s.postalCode)
  const [hydrated, setHydrated] = useState(() =>
    useAppStore.persist.hasHydrated()
  )

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAppStore.persist.hasHydrated())
    return unsub
  }, [])

  if (!hydrated) return null
  if (!langChosen) return <Language />
  if (!postalCode) return <Navigate to="/onboarding" replace />
  return <Navigate to="/home" replace />
}

export default Index
