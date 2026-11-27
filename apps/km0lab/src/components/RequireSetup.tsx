import { useAppStore } from '@km0lab/app'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * RequireSetup — no deja avanzar sin los mínimos de información.
 *
 * - `language`: hace falta elección explícita de idioma (`langChosen`).
 * - `location`: hace falta idioma + código postal (Home y auth).
 */
export type SetupRequirement = 'language' | 'location'

interface RequireSetupProps {
  need?: SetupRequirement
  children: ReactNode
}

export default function RequireSetup({
  need = 'location',
  children,
}: RequireSetupProps) {
  const navigate = useNavigate()
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

  useEffect(() => {
    if (!hydrated) return
    if (!langChosen) {
      navigate('/', { replace: true })
      return
    }
    if (need === 'location' && !postalCode) {
      navigate('/onboarding', { replace: true })
    }
  }, [hydrated, langChosen, postalCode, need, navigate])

  if (!hydrated) return null
  if (!langChosen) return null
  if (need === 'location' && !postalCode) return null

  return <>{children}</>
}
