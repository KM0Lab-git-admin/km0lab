import {
  useAuth,
  useProfile,
  useNotifications,
  t,
  useFeaturedPromos,
  usePublicRewards,
  INVITATIONS_MOCK_SUMMARY,
} from '@km0lab/app'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { ApiReward } from '@km0lab/app'

import DeviceShell from '@/components/DeviceShell'
import HomeContent from '@/components/HomeContent'
import { type HomeModule, type HomeModuleId } from '@/components/HomeModules'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import PointsRewardOverlay from '@/components/PointsRewardOverlay'
import { useLang } from '@/contexts/LangContext'
import { INITIAL_MODULES, type HomeModuleSeed } from '@/data/homeModules'
import { PROMOS } from '@/data/promos'
import { REWARDS } from '@/data/rewards'

/** Fallback mock mientras la API carga o si falla: catálogo local activo. */
const MOCK_REWARDS: ApiReward[] = REWARDS.filter(
  (r) => r.status === 'active'
).map((r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  kind: r.kind,
  costPoints: r.costPoints,
  valueLabel: r.valueLabel,
  stock: r.stock,
  imageUrl: null,
}))

type HomeProps = {
  /** Forzar estado para previews (`/home-registered`, `/home-no-registrado`). */
  forceAuthState?: 'authed' | 'guest'
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
  // canjats, perfil) sean navegables desde `/home-registered` sin sesión real.
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
  const [rewardOpen, setRewardOpen] = useState(
    searchParams.get('welcome') === '1'
  )
  const [moduleSeeds, setModuleSeeds] =
    useState<HomeModuleSeed[]>(INITIAL_MODULES)

  const { promos: apiPromos } = useFeaturedPromos(4)
  const promos = apiPromos.length > 0 ? apiPromos : PROMOS

  const { rewards: apiRewards } = usePublicRewards()
  const rewards = apiRewards.length > 0 ? apiRewards : MOCK_REWARDS

  const toggleModule = (id: HomeModuleId) => {
    setModuleSeeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    )
  }

  const modulesWithHandlers: HomeModule[] = useMemo(
    () =>
      moduleSeeds.map((m) => {
        // Premis es acceso rápido público (catálogo /rewards); no se gatea
        // por sesión — el locked de HomeContent cubre conversión a registro.
        const active = m.active
        return {
          id: m.id,
          active,
          label: t(m.labelKey, lang),
          onClick: () => {
            if (!active) return
            if (m.id === 'agenda') {
              navigate('/events')
              return
            }
            if (m.id === 'noticias') {
              navigate('/news')
              return
            }
            if (m.id === 'comerc') {
              navigate('/merchants')
              return
            }
            if (m.id === 'premis') {
              navigate('/rewards')
              return
            }
            toggleModule(m.id)
          },
        }
      }),
    [moduleSeeds, lang, navigate]
  )

  const openNotifications = () => {
    setNotifOpen(true)
    markAllSeen()
  }

  const goToProfile = () => navigate('/profile')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/points-history')
  const goToRewards = () => navigate('/redeemed-rewards')

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
    rewards,
    activeTab: 'home' as const,
    isAuthed,
    onLogin: goToLogin,
    onHowItWorks: () => navigate('/how-it-works'),
    onHome: () => {},
    onProfile: goToProfile,
    onPoints: goToPoints,
    onRewards: goToRewards,
    onActions: () => navigate('/points-actions'),
    onInvite: () => navigate('/invite'),
    onViewInvitations: () =>
      navigate('/my-invitations?from=home', {
        state: { invitationOrigin: 'home' },
      }),
    invitationSummary: isAuthed ? INVITATIONS_MOCK_SUMMARY : null,
    showLogin,
    showPoints,
    onSeeAllEvents: () => navigate('/events'),
    onSeeAllRewards: () => navigate('/rewards'),
    onSeeAllPromos: () => navigate('/rewards?tab=promos'),
    onOpenEvent: (id: string) => navigate(`/event?id=${id}`),
    onOpenPointsHistory: () => navigate('/points-history'),
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
          {rewardOpen && isAuthed && (
            <PointsRewardOverlay
              points={100}
              message="Per registrar-te a KM0 LAB"
              contained
              onClose={() => {
                setRewardOpen(false)
                if (searchParams.get('welcome')) {
                  const next = new URLSearchParams(searchParams)
                  next.delete('welcome')
                  setSearchParams(next, { replace: true })
                }
              }}
            />
          )}
        </div>
      </div>
    </DeviceShell>
  )
}

export default Home
