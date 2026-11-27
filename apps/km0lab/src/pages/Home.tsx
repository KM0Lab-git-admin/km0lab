import {
  useAccount,
  useLocationContext,
  usePointsConfig,
  useAuth,
  useProfile,
  useNotifications,
  t,
  usePreviewState,
  getContentPath,
  useFeaturedPromos,
  usePublicRewards,
  useInviteSummary,
  useSetHomeTown,
  useTerritory,
  useScopeNews,
} from '@km0lab/app'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { HomeScopeProps } from '@/components/HomeContent'

import HomeContent from '@/components/HomeContent'
import { type HomeModule, type HomeModuleId } from '@/components/HomeModules'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import PointsRewardOverlay from '@/components/PointsRewardOverlay'
import TownPickerSheet from '@/components/TownPickerSheet'
import { useLang } from '@/contexts/LangContext'
import { INITIAL_MODULES, type HomeModuleSeed } from '@/data/homeModules'

type HomeProps = {
  /** Forzar estado para previews (`/home-registered`, `/home-no-registrado`). */
  forceAuthState?: 'authed' | 'guest'
}

const Home = ({ forceAuthState }: HomeProps = {}) => {
  const pointsConfig = usePointsConfig()
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
  const account = useAccount()
  const { summary: invitationSummary } = useInviteSummary()
  const { town: cityName } = useLocationContext()
  const { lang } = useLang()
  const navigate = useNavigate()
  const preview = usePreviewState(false, false, false)
  const contentPath = (path: string) =>
    getContentPath(path, preview.isSample ? 'sample' : 'live')

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
  const [sheetContainer, setSheetContainer] = useState<HTMLDivElement | null>(
    null
  )

  const {
    promos,
    loading: eventsLoading,
    error: eventsError,
    reload: reloadEvents,
  } = useFeaturedPromos(4)

  const territory = useTerritory()
  const scopeNews = useScopeNews()
  const setHomeTown = useSetHomeTown()
  const [townPickerOpen, setTownPickerOpen] = useState(false)
  const scope: HomeScopeProps | undefined =
    territory.isGrouped && territory.homeTown
      ? {
          homeTownName: territory.homeTown.name,
          nearbyTownNames: territory.nearbyTowns.map((town) => town.name),
          onChangeTown: () => setTownPickerOpen(true),
          homeNews: scopeNews.home,
          nearbyNews: scopeNews.nearby,
          failedTownNames: {
            home: scopeNews.failedTownIds.includes(territory.homeTown.id),
            nearby: territory.nearbyTowns
              .filter((town) => scopeNews.failedTownIds.includes(town.id))
              .map((town) => town.name),
          },
          newsLoading: scopeNews.loading,
          newsError: scopeNews.error,
          reloadNews: scopeNews.reload,
          onSeeAllNews: () => navigate(contentPath('/news')),
          onOpenNews: (id: string) =>
            navigate(contentPath(`/news?id=${encodeURIComponent(id)}`)),
        }
      : undefined

  const {
    rewards,
    loading: rewardsLoading,
    error: rewardsError,
    reload: reloadRewards,
  } = usePublicRewards()

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
              navigate(contentPath('/events'))
              return
            }
            if (m.id === 'noticias') {
              navigate(contentPath('/news'))
              return
            }
            if (m.id === 'comerc') {
              navigate(contentPath('/merchants'))
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
    [moduleSeeds, lang, navigate, preview.isSample]
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

  const points = isAuthed ? account.balance : 0
  const level = Math.floor(points / 1000) + 1
  const nextLevel = level * 1000
  const nextReward = rewards.find((reward) => reward.costPoints > points)?.title

  const reloadContent = () =>
    preview.retry(() => {
      reloadEvents()
      scopeNews.reload()
      reloadRewards()
    })
  const sharedProps = {
    contentState: preview.state,
    isSample: preview.isSample,
    onRetryContent: reloadContent,
    cityName,
    townArtSrc: territory.loading ? null : territory.homeTown?.artUrl,
    hasAlerts: hasUnread,
    onToggleAlerts: openNotifications,
    greeting,
    subtitle,
    points,
    accountLoading: account.loading,
    nextLevel,
    nextReward,
    level,
    modules: modulesWithHandlers,
    promos,
    eventsLoading,
    eventsError: !!eventsError,
    rewards,
    rewardsLoading,
    rewardsError,
    reloadRewards,
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
    invitationSummary: isAuthed ? invitationSummary : null,
    showLogin,
    showPoints,
    onSeeAllEvents: () => navigate(contentPath('/events')),
    onSeeAllRewards: () => navigate('/rewards'),
    onSeeAllPromos: () => navigate('/rewards?tab=promos'),
    onOpenEvent: (id: string) => navigate(`/event?id=${id}`),
    onOpenPointsHistory: () => navigate('/points-history'),
    scope,
  }

  return (
    <>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div
          ref={setSheetContainer}
          className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50"
        >
          <HomeContent {...sharedProps} />
          {territory.territory && territory.isGrouped && (
            <TownPickerSheet
              open={townPickerOpen}
              onClose={() => setTownPickerOpen(false)}
              towns={territory.territory.towns}
              homeTownId={territory.territory.homeTownId}
              onSave={setHomeTown}
              lang={lang}
              container={sheetContainer}
            />
          )}
          <NotificationsOverlay
            open={notifOpen}
            items={notifications}
            loading={notifLoading}
            error={notifError}
            lang={lang}
            onClose={() => setNotifOpen(false)}
            onReload={reloadNotifs}
            container={sheetContainer}
          />
          {rewardOpen && isAuthed && (
            <PointsRewardOverlay
              points={pointsConfig.signup}
              message={t('home.welcome.reason', lang)}
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
    </>
  )
}

export default Home
