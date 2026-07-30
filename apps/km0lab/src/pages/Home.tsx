import {
  useAuth,
  useProfile,
  useNotifications,
  t,
  useFeaturedPromos,
  useHomeRewards,
  useUserPoints,
  useAppStore,
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
  /** Forzar estado para previews (`/home-registered`, `/home-unregistered`). */
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
  const { points: userPoints } = useUserPoints()
  const { rewards } = useHomeRewards()
  const { lang } = useLang()
  const navigate = useNavigate()

  const isAuthed = forceAuthState ? forceAuthState === 'authed' : !!user
  const showLogin = !isAuthed
  const showProfile = isAuthed
  const showPoints = isAuthed

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

  const firstName = showProfile ? profile?.first_name?.trim() || null : null

  const greeting = showLogin
    ? t('home.greeting.guest', lang)
    : t('home.greeting.registered', lang).replace('{name}', firstName ?? '')
  const subtitle = showLogin
    ? t('home.subtitle.guest', lang)
    : t('home.subtitle.registered', lang)

  const storedTown = useAppStore((s) => s.town)
  const cityName = profile?.town || storedTown || 'Malgrat de Mar'

  const points = isAuthed ? userPoints : 0
  const level = 1

  const nextRewardTarget = useMemo(() => {
    if (!isAuthed) return null
    const candidates = rewards
      .filter((r) => r.status === 'active' && r.costPoints > points)
      .sort((a, b) => a.costPoints - b.costPoints)
    return candidates[0] ?? null
  }, [isAuthed, rewards, points])

  const nextLevel = nextRewardTarget?.costPoints ?? 1000
  const nextReward = nextRewardTarget?.title

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
    onActions: () => navigate('/points-actions'),
    showLogin,
    showPoints,
    onSeeAllEvents: () => navigate('/events'),
    onSeeAllRewards: () => navigate('/rewards'),
    onSeeAllPromos: () => navigate('/rewards?tab=promos'),
    onOpenEvent: (id: string) => navigate(`/event?id=${id}`),
    onOpenPointsHistory: () => navigate('/points-history'),
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
