import { t, useDragScroll } from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { ArrowRight } from 'lucide-react'

import type { HomeTab } from '@/components/BottomTabs'
import type { Promo, ApiReward, InvitationsSummary } from '@km0lab/app'

import BottomTabs from '@/components/AccountBottomTabs'
import EarnPointsCard from '@/components/EarnPointsCard'
import EventHeroCarousel from '@/components/EventHeroCarousel'
import HomeHero from '@/components/HomeHero'
import HomeModules, { type HomeModule } from '@/components/HomeModules'
import InviteHomeCard from '@/components/InviteHomeCard'
import JoinCard from '@/components/JoinCard'
import MerchantPromosPreview from '@/components/MerchantPromosPreview'
import PointsCard from '@/components/PointsCard'
import RewardsPreview from '@/components/RewardsPreview'
import { useLang } from '@/contexts/LangContext'

export interface HomeContentProps {
  cityName: string
  townArtSrc?: string
  hasAlerts: boolean
  onToggleAlerts: () => void
  /** Saludo ya localizado (e.g. "Bon dia, Aina 👋" o "Hola! 👋"). */
  greeting: string
  /** Subtítulo ya localizado según estado (guest vs registered). */
  subtitle: string
  points: number
  accountLoading?: boolean
  nextLevel: number
  nextReward?: string
  level?: number
  modules: HomeModule[]
  promos: Promo[]
  eventsLoading?: boolean
  eventsError?: boolean
  /** Premios públicos (API UAT); Home resuelve fallback mock si falla. */
  rewards: ApiReward[]
  rewardsLoading?: boolean
  rewardsError?: boolean
  reloadRewards?: () => void

  activeTab: HomeTab
  isAuthed: boolean
  onLogin: (tab?: HomeTab) => void
  onHowItWorks: () => void
  onHome: () => void
  onProfile: () => void
  onPoints: () => void
  onRewards: () => void
  onActions: () => void
  onInvite: () => void
  onViewInvitations: () => void
  invitationSummary: InvitationsSummary | null

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
  townArtSrc,
  hasAlerts,
  onToggleAlerts,
  points,
  accountLoading,
  nextLevel,
  nextReward,
  level,
  modules,
  promos,
  eventsLoading,
  eventsError,
  rewards,
  rewardsLoading,
  rewardsError,
  reloadRewards,

  activeTab,
  isAuthed,
  onLogin,
  onHowItWorks,
  onHome,
  onProfile,
  onPoints,
  onRewards,
  onActions,
  onInvite,
  onViewInvitations,
  invitationSummary,
  showLogin,
  showPoints,

  onSeeAllEvents,
  onSeeAllRewards,
  onSeeAllPromos,
  onOpenEvent,
  onOpenPointsHistory,
}: HomeContentProps) => {
  const { lang } = useLang()
  const scrollRef = useDragScroll('vertical')

  return (
    <>
      <HomeHero
        cityName={cityName}
        townArtSrc={townArtSrc}
        hasAlerts={hasAlerts}
        onToggleAlerts={onToggleAlerts}
        showGreeting={false}
      />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none"
      >
        <div className="relative z-10 flex flex-col gap-5 px-4 pt-4 pb-7">
          <section className="flex flex-col gap-3">
            {showLogin && (
              <JoinCard
                onCreateAccount={onLogin}
                onLogin={onLogin}
                onHowItWorks={onHowItWorks}
              />
            )}
            {showPoints && accountLoading && (
              <div
                aria-busy
                className="h-20 animate-pulse rounded-3xl bg-muted"
              />
            )}
            {showPoints && !accountLoading && (
              <PointsCard
                points={points}
                nextLevel={nextLevel}
                nextReward={nextReward}
                level={level}
                onClick={onOpenPointsHistory}
              />
            )}
          </section>

          <section className="rounded-3xl bg-card p-4 shadow-[var(--shadow-bubble)] space-y-3">
            <SectionHeader title={t('home.section.quick', lang)} />
            <HomeModules modules={modules} />
          </section>

          <section className="space-y-3">
            <SectionHeader
              title={t('home.section.events', lang)}
              actionLabel={t('home.action.see_all_m', lang)}
              onAction={onSeeAllEvents}
            />
            {eventsLoading ? (
              <div
                aria-busy
                className="h-40 animate-pulse rounded-3xl bg-muted"
              />
            ) : eventsError ? (
              <p role="alert" className="font-body text-xs text-destructive">
                {t('agenda.error', lang)}
              </p>
            ) : promos.length === 0 ? (
              <p className="font-body text-xs text-muted-foreground">
                {t('agenda.empty.title', lang)}
              </p>
            ) : (
              <EventHeroCarousel promos={promos} onOpen={onOpenEvent} />
            )}
          </section>

          <EarnPointsCard
            onSeeAll={onActions}
            locked={false}
            onLogin={onLogin}
            isAuthed={isAuthed}
          />

          <section className="space-y-3">
            <SectionHeader
              title={t('home.section.rewards', lang)}
              actionLabel={t('home.action.see_all_m', lang)}
              onAction={onSeeAllRewards}
            />
            {rewardsLoading ? (
              <div
                aria-busy
                className="h-40 animate-pulse rounded-3xl bg-muted"
              />
            ) : rewardsError ? (
              <div role="alert">
                <p className="font-body text-xs text-destructive">
                  {t('catalog.error', lang)}
                </p>
                <Button variant="bubbleLink" onClick={reloadRewards}>
                  {t('merchants.error.retry', lang)}
                </Button>
              </div>
            ) : rewards.length === 0 ? (
              <p className="font-body text-xs text-muted-foreground">
                {t('rewards.empty', lang)}
              </p>
            ) : (
              <RewardsPreview items={rewards} onSeeAll={onSeeAllRewards} />
            )}
          </section>

          <MerchantPromosPreview
            onSeeAll={onSeeAllPromos}
            locked={false}
            onLogin={onLogin}
          />
          <div>
            <InviteHomeCard
              isAuthed={isAuthed}
              onInvite={onInvite}
              onLogin={onLogin}
              onCreateAccount={onLogin}
              onViewInvitations={onViewInvitations}
              invitationSummary={invitationSummary}
            />
          </div>
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
    </>
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
    <h2 className="font-brand font-black text-km0-blue-800 text-lg">{title}</h2>
    {actionLabel && (
      <Button
        variant="bubbleLink"
        type="button"
        onClick={onAction}
        className="h-auto min-h-11 shrink-0 gap-1 px-0 text-xs text-km0-coral-700"
      >
        {actionLabel}
        <ArrowRight size={13} strokeWidth={2.4} />
      </Button>
    )}
  </div>
)

export default HomeContent
