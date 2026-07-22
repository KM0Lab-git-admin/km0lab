import { useAuth, useProfile, useNotifications, t } from '@km0lab/app'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { type HomeTab } from '@/components/BottomTabs'
import DeviceShell from '@/components/DeviceShell'
import HomeContent from '@/components/HomeContent'
import { type HomeModule, type HomeModuleId } from '@/components/HomeModules'
import NotificationsOverlay from '@/components/NotificationsOverlay'
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
  const { notifications, hasUnread, markRead, markAllRead } = useNotifications()
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

  const [searchParams] = useSearchParams()
  const [notifOpen, setNotifOpen] = useState(
    searchParams.get('notifs') === 'open'
  )
  const [moduleSeeds, setModuleSeeds] =
    useState<HomeModuleSeed[]>(INITIAL_MODULES)
  const [activeTab, setActiveTab] = useState<HomeTab>('home')

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
          toggleModule(m.id)
        },
      })),
    [moduleSeeds, lang, navigate]
  )

  const openNotifications = () => {
    setNotifOpen(true)
    markAllRead()
  }

  const goToProfile = () => navigate('/profile')
  const goToLogin = () => navigate('/login')

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

  // Puntos mock: registrado tiene mínimo 100 pts de bienvenida.
  const points = isAuthed ? 1240 : 0
  const level = isAuthed ? 4 : 1
  const nextLevel = 1500
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
    promos: PROMOS,
    comercios: COMERCIOS,
    coupons: REDEEM_COUPONS,
    activeTab,
    onTabChange: setActiveTab,
    showLogin,
    onLogin: goToLogin,
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
            notifications={notifications}
            onClose={() => setNotifOpen(false)}
            onMarkRead={markRead}
          />
        </div>
      </div>
    </DeviceShell>
  )
}

export default Home
