import {
  useAuth,
  useProfile,
  useNotifications,
  t,
  useFeaturedPromos,
  readPendingReward,
  clearPendingReward,
  claimBirthday,
} from '@km0lab/app'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import DeviceShell from '@/components/DeviceShell'
import HomeContent from '@/components/HomeContent'
import { type HomeModule, type HomeModuleId } from '@/components/HomeModules'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import PointsRewardOverlay from '@/components/PointsRewardOverlay'
import { useLang } from '@/contexts/LangContext'
import { INITIAL_MODULES, type HomeModuleSeed } from '@/data/homeModules'
import { PROMOS } from '@/data/promos'

type HomeProps = {
  /** Forzar estado para previews (`/home-registrado`, `/home-no-registrado`). */
  forceAuthState?: 'authed' | 'guest'
}

type RewardState = {
  points: number
  message: string
}

const Home = ({ forceAuthState }: HomeProps = {}) => {
  const {
    items: notifications,
    hasUnread,
    loading: notifLoading,
    error: notifError,
    reload: reloadNotifs,
    markAllSeen,
  } = useNotifications()
  const { user, loading: authLoading } = useAuth()
  const { profile } = useProfile()
  const { lang } = useLang()
  const navigate = useNavigate()

  // Estado real según sesión: sin user → mostrar CTA de login y ocultar
  // puntos / acceso a perfil. Con user → al revés.
  // Las rutas de preview pueden forzar el estado con `forceAuthState`.
  const isAuthed = forceAuthState ? forceAuthState === 'authed' : !!user
  const showLogin = !isAuthed
  const showProfile = isAuthed
  const showPoints = isAuthed

  // Bandera de preview: permite que las rutas protegidas (historial, premis
  // canjats, perfil) sean navegables desde `/home-registrado` sin sesión real.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (forceAuthState === 'authed') {
      sessionStorage.setItem('km0_preview_authed', '1')
    } else if (forceAuthState === 'guest') {
      sessionStorage.removeItem('km0_preview_authed')
    }
  }, [forceAuthState])

  const [searchParams, setSearchParams] = useSearchParams()
  const [notifOpen, setNotifOpen] = useState(
    searchParams.get('notifs') === 'open'
  )
  const [reward, setReward] = useState<RewardState | null>(() => {
    if (searchParams.get('welcome') !== '1') return null
    const pending = readPendingReward()
    if (pending) {
      return {
        points: pending.points,
        message: pending.message?.trim() || 'KM0 LAB',
      }
    }
    return null
  })
  const [moduleSeeds, setModuleSeeds] =
    useState<HomeModuleSeed[]>(INITIAL_MODULES)

  // Al abrir la app: reclamar puntos de aniversario si aplica (una vez/año).
  useEffect(() => {
    if (!isAuthed || forceAuthState === 'guest') return
    if (searchParams.get('welcome') === '1') return
    if (authLoading) return
    let cancelled = false
    ;(async () => {
      const claim = await claimBirthday()
      if (cancelled || !claim?.awarded || claim.points <= 0) return
      setReward(
        (prev) =>
          prev ?? {
            points: claim.points,
            message: claim.message?.trim() || 'Happy birthday',
          }
      )
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthed, forceAuthState, authLoading, searchParams])

  const { promos: apiPromos } = useFeaturedPromos(4)
  const promos = apiPromos.length > 0 ? apiPromos : PROMOS

  const toggleModule = (id: HomeModuleId) => {
    setModuleSeeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    )
  }

  const modulesWithHandlers: HomeModule[] = useMemo(
    () =>
      moduleSeeds.map((m) => {
        const requiresAuth = m.id === 'premis'
        const gatedInactive = requiresAuth && !isAuthed
        const active = m.active && !gatedInactive
        return {
          id: m.id,
          active,
          disabledReason: gatedInactive ? 'requires_registration' : undefined,
          label: t(m.labelKey, lang),
          onClick: () => {
            if (!active) {
              if (gatedInactive) navigate('/login')
              return
            }
            if (m.id === 'agenda') {
              navigate('/agenda')
              return
            }
            if (m.id === 'noticias') {
              navigate('/noticias')
              return
            }
            if (m.id === 'comerc') {
              navigate('/comercos')
              return
            }
            if (m.id === 'premis') {
              navigate('/premis')
              return
            }
            toggleModule(m.id)
          },
        }
      }),
    [moduleSeeds, lang, navigate, isAuthed]
  )

  const openNotifications = () => {
    setNotifOpen(true)
    markAllSeen()
  }

  const goToProfile = () => navigate('/profile')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/historial-punts')
  const goToRewards = () => navigate('/premis-canjats')

  // Nombre: solo si el usuario está registrado Y ha guardado un first_name.
  const firstName = showProfile ? profile?.first_name?.trim() || null : null

  // Saludo + subtítulo localizados según estado.
  const greeting = showLogin
    ? t('home.greeting.guest', lang)
    : t('home.greeting.registered', lang).replace('{name}', firstName ?? '')
  const subtitle = showLogin
    ? t('home.subtitle.guest', lang)
    : t('home.subtitle.registered', lang)

  // Ciudad: prioriza perfil → localStorage → fallback.
  const storedTown = (() => {
    try {
      return localStorage.getItem('km0_town')
    } catch {
      return null
    }
  })()
  const cityName = profile?.town || storedTown || 'Malgrat de Mar'

  // Puntos mock: registrado empieza con 100 pts de bienvenida (nivel 1,
  // barra de progreso al 10% hacia el nivel 2 en 1.000 pts).
  const points = isAuthed ? 100 : 0
  const level = isAuthed ? 1 : 1
  const nextLevel = 1000
  const nextReward = isAuthed ? 'Val de 5€ al Forn Rovira' : undefined

  const sharedProps = {
    cityName,
    hasAlerts: hasUnread,
    onToggleAlerts: openNotifications,
    greeting,
    subtitle,
    points,
    nextLevel,
    nextReward,
    level,
    modules: modulesWithHandlers,
    promos,
    activeTab: 'home' as const,
    isAuthed,
    onLogin: goToLogin,
    onHome: () => {},
    onProfile: goToProfile,
    onPoints: goToPoints,
    onRewards: goToRewards,
    showLogin,
    showPoints,
    onSeeAllEvents: () => navigate('/agenda'),
    onOpenEvent: (id: string) => navigate(`/evento?id=${id}`),
    onOpenPointsHistory: () => navigate('/historial-punts'),
  }

  const closeReward = () => {
    setReward(null)
    clearPendingReward()
    if (searchParams.get('welcome')) {
      const next = new URLSearchParams(searchParams)
      next.delete('welcome')
      setSearchParams(next, { replace: true })
    }
  }

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          <HomeContent {...sharedProps} />
          <NotificationsOverlay
            open={notifOpen}
            items={notifications}
            loading={notifLoading}
            error={notifError}
            lang={lang}
            onClose={() => setNotifOpen(false)}
            onReload={reloadNotifs}
          />
          {reward && isAuthed && (
            <PointsRewardOverlay
              points={reward.points}
              message={reward.message}
              contained
              onClose={closeReward}
            />
          )}
        </div>
      </div>
    </DeviceShell>
  )
}

export default Home
