import HomeModules, { type HomeModule } from './HomeModules'
import HomeHero from './HomeHero'
import EventHeroCarousel from './EventHeroCarousel'
import PointsCard from './PointsCard'
import JoinCard from './JoinCard'
import EarnPointsCard from './EarnPointsCard'
import RewardsPreview from './RewardsPreview'
import MerchantPromosPreview from './MerchantPromosPreview'
import BottomTabs, { type HomeTab } from './BottomTabs'
import { ArrowRight } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import { isDemoPostalCode, t, useAppStore } from '@km0lab/app'

import type { Promo } from '@km0lab/app'

export interface HomeContentProps {
  cityName: string
  hasAlerts: boolean
  onToggleAlerts: () => void
  /** Saludo ya localizado (e.g. "Bon dia, Aina 👋" o "Hola! 👋"). */
  greeting: string
  /** Subtítulo ya localizado según estado (guest vs registered). */
  subtitle: string
  points: number
  nextLevel: number
  nextReward?: string
  level?: number
  modules: HomeModule[]
  promos: Promo[]

  activeTab: HomeTab
  isAuthed: boolean
  onLogin: () => void
  onHome: () => void
  onProfile: () => void
  onPoints: () => void
  onRewards: () => void
  onActions: () => void

  /** Solo se muestra PointsCard si hay sesión. */
  showLogin: boolean
  showPoints: boolean
  onSeeAllEvents?: () => void
  onSeeAllRewards?: () => void
  onSeeAllPromos?: () => void
  onOpenEvent?: (id: string) => void
  onOpenPointsHistory?: () => void
}

const HomeContent = ({
  cityName,
  hasAlerts,
  onToggleAlerts,
  points,
  nextLevel,
  nextReward,
  level,
  modules,
  promos,

  activeTab,
  isAuthed,
  onLogin,
  onHome,
  onProfile,
  onPoints,
  onRewards,
  onActions,
  showLogin,
  showPoints,

  onSeeAllEvents,
  onSeeAllRewards,
  onSeeAllPromos,
  onOpenEvent,
  onOpenPointsHistory,
}: HomeContentProps) => {
  const { lang } = useLang()
  const postalCode = useAppStore((s) => s.postalCode)
  const showDemoBadge = isDemoPostalCode(postalCode)

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <HomeHero
        cityName={cityName}
        hasAlerts={hasAlerts}
        onToggleAlerts={onToggleAlerts}
        showGreeting={false}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <div className="relative z-10 flex flex-col gap-5 px-2 pt-4 pb-6">
          {showDemoBadge ? (
            <p className="text-center font-ui font-bold text-xs text-km0-teal-600 uppercase tracking-wide px-4">
              {t('home.demo.badge', lang)}
            </p>
          ) : null}

          <section className="flex flex-col gap-3 px-2">
            {showLogin && <JoinCard onCreateAccount={onLogin} />}
            {showPoints && (
              <PointsCard
                points={points}
                nextLevel={nextLevel}
                nextReward={nextReward}
                level={level}
                onClick={onOpenPointsHistory}
              />
            )}
          </section>

          <section className="rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 space-y-3 px-[10px] py-[10px]">
            <SectionHeader title={t('home.section.quick', lang)} />
            <HomeModules modules={modules} />
          </section>

          <section className="rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-6 py-6 space-y-3">
            <SectionHeader
              title={t('home.section.events', lang)}
              actionLabel={t('home.action.see_all_m', lang)}
              onAction={onSeeAllEvents}
            />
            <EventHeroCarousel promos={promos} onOpen={onOpenEvent} />
          </section>

          {!isAuthed && (
            <p className="text-center font-ui font-bold text-sm text-km0-coral-400 px-4">
              {t('home.members.teaser', lang)}
            </p>
          )}

          <EarnPointsCard
            onSeeAll={onActions}
            locked={false}
            onLogin={onLogin}
          />

          <section className="rounded-3xl border border-km0-beige-200 bg-gradient-to-b from-card/90 to-secondary/40 shadow-[0_20px_50px_-32px_hsl(var(--foreground)/0.38)] ring-1 ring-white/60 px-6 py-6 space-y-3">
            <SectionHeader
              title={t('home.section.rewards', lang)}
              actionLabel={t('home.action.see_all_m', lang)}
              onAction={onSeeAllRewards}
            />
            <RewardsPreview onSeeAll={onSeeAllRewards} />
          </section>

          <MerchantPromosPreview
            onSeeAll={onSeeAllPromos}
            locked={false}
            onLogin={onLogin}
          />
        </div>
      </div>

      <BottomTabs
        activeTab={activeTab}
        isAuthed={isAuthed}
        onLogin={onLogin}
        onHome={onHome}
        onProfile={onProfile}
        onPoints={onPoints}
        onRewards={onRewards}
        onActions={onActions}
      />
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

const SectionHeader = ({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) => (
  <div className="flex items-center justify-between gap-2">
    <h2 className="font-brand font-black text-km0-blue-800 text-base">
      {title}
    </h2>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="font-ui font-bold text-km0-coral-400 active:scale-95 transition-transform underline underline-offset-4 text-xs gap-0 flex items-center justify-start whitespace-nowrap shrink-0"
      >
        {actionLabel}
        <ArrowRight size={13} strokeWidth={2.4} />
      </button>
    )}
  </div>
)

export default HomeContent
