import {
  useAuth,
  useProfile,
  useNotifications,
  t,
  useFeaturedPromos,
  useAppStore,
} from '@km0lab/app'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { type HomeTab } from '@/components/BottomTabs'
import DeviceShell from '@/components/DeviceShell'
import HomeContent from '@/components/HomeContent'
import { type HomeModule, type HomeModuleId } from '@/components/HomeModules'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import PointsRewardOverlay from '@/components/PointsRewardOverlay'
import { useLang } from '@/contexts/LangContext'
import { COMERCIOS } from '@/data/comercios'
import { INITIAL_MODULES, type HomeModuleSeed } from '@/data/homeModules'
import { PROMOS } from '@/data/promos'
import { REDEEM_COUPONS } from '@/data/redeemCoupons'

type HomeProps = {
  /** Forzar estado para previews (`/home-registrado`, `/home-no-registrado`). */
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
  const { user, loading: authLoading, resetDeviceSetup } = useAuth()
  const { profile } = useProfile()
  const { lang } = useLang()
  const town = useAppStore((s) => s.town)
  const navigate = useNavigate()

  // Estado real según sesión: sin user → mostrar CTA de login y ocultar
  // puntos / acceso a perfil. Con user → al revés.
  // Las rutas de preview pueden forzar el estado con `forceAuthState`.
  const isAuthed = forceAuthState ? forceAuthState === 'authed' : !!user
  const showLogin = !isAuthed
  const showProfile = isAuthed
  const showPoints = isAuthed

  const [searchParams, setSearchParams] = useSearchParams()
  const [notifOpen, setNotifOpen] = useState(
    searchParams.get('notifs') === 'open'
  )
  const [rewardOpen, setRewardOpen] = useState(
    searchParams.get('welcome') === '1'
  )
  const [moduleSeeds, setModuleSeeds] =
    useState<HomeModuleSeed[]>(INITIAL_MODULES)
  const [activeTab, setActiveTab] = useState<HomeTab>('home')
  const { promos: apiPromos } = useFeaturedPromos(4)
  const promos = apiPromos.length > 0 ? apiPromos : PROMOS

  const toggleModule = (id: HomeModuleId) => {
    setModuleSeeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    )
  }

  const modulesWithHandlers: HomeModule[] = useMemo(
    () =>
      moduleSeeds.map((m) => ({
        id: m.id,
        active: m.active,
        label: t(m.labelKey, lang),
        onClick: () => {
          if (m.id === 'agenda') {
            navigate('/agenda')
            return
          }
          if (m.id === 'noticias') {
            navigate('/noticias')
            return
          }
          toggleModule(m.id)
        },
      })),
    [moduleSeeds, lang, navigate]
  )

  const openNotifications = () => {
    setNotifOpen(true)
    markAllSeen()
  }

  const goToProfile = () => navigate('/profile')
  const goToLogin = () => navigate('/login')
  const resetSetup = async () => {
    await resetDeviceSetup()
    navigate('/', { replace: true })
  }

  // Nombre: solo si el usuario está registrado Y ha guardado un first_name.
  const firstName = showProfile ? profile?.first_name?.trim() || null : null

  // Saludo + subtítulo localizados según estado.
  const greeting = showLogin
    ? t('home.greeting.guest', lang)
    : t('home.greeting.registered', lang).replace('{name}', firstName ?? '')
  const subtitle = showLogin
    ? t('home.subtitle.guest', lang)
    : t('home.subtitle.registered', lang)

  const cityName = profile?.town || town || 'Malgrat de Mar'

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
    comercios: COMERCIOS,
    coupons: REDEEM_COUPONS,
    activeTab,
    onTabChange: setActiveTab,
    showLogin,
    onLogin: goToLogin,
    onResetSetup: showLogin ? resetSetup : undefined,
    showProfile,
    onProfile: goToProfile,
    showPoints,
    onSeeAllComercios: () => {},
    onSeeAllEvents: () => navigate('/agenda'),
    onSeeAllCoupons: () => {},
    onOpenEvent: (id: string) => navigate(`/evento?id=${id}`),
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
              message={t('reward.register_reason', lang)}
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
