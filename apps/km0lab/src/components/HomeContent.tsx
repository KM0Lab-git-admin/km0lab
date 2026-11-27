import { t, tf, useDragScroll } from '@km0lab/app'
import { Button } from '@km0lab/ui'

import type { HomeTab } from '@/components/BottomTabs'
import type {
  ScreenState,
  Promo,
  Noticia,
  ScopedItem,
  ApiReward,
  InvitationsSummary,
} from '@km0lab/app'

import BottomTabs from '@/components/AccountBottomTabs'
import EarnPointsCard from '@/components/EarnPointsCard'
import EventHeroCarousel from '@/components/EventHeroCarousel'
import HomeHero from '@/components/HomeHero'
import HomeModules, { type HomeModule } from '@/components/HomeModules'
import InviteHomeCard from '@/components/InviteHomeCard'
import JoinCard from '@/components/JoinCard'
import MerchantPromosPreview from '@/components/MerchantPromosPreview'
import NoticiaCard from '@/components/NoticiaCard'
import PointsCard from '@/components/PointsCard'
import RewardsPreview from '@/components/RewardsPreview'
import ScreenStatus from '@/components/ScreenStatus'
import SectionHeader from '@/components/SectionHeader'
import { useLang } from '@/contexts/LangContext'

export interface HomeContentProps {
  contentState?: ScreenState
  isSample?: boolean
  onRetryContent?: () => void
  cityName: string
  townArtSrc?: string | null
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
  /** Present only when the scope groups several towns. */
  scope?: HomeScopeProps
}

export interface HomeScopeProps {
  homeTownName: string
  nearbyTownNames: string[]
  onChangeTown: () => void
  homeNews: ScopedItem<Noticia>[]
  nearbyNews: ScopedItem<Noticia>[]
  failedTownNames: { home: boolean; nearby: string[] }
  newsLoading: boolean
  newsError: string | null
  reloadNews: () => void
  onSeeAllNews: () => void
  onOpenNews: (id: string) => void
}

const HomeContent = ({
  contentState = 'ready',
  isSample = false,
  onRetryContent = () => {},
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
  scope,
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
        onChangeTown={scope?.onChangeTown}
      />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none"
      >
        <div className="relative z-10 flex flex-col gap-5 px-4 pt-4 pb-7">
          {isSample && (
            <p
              role="status"
              className="font-ui text-xs font-bold text-km0-coral-700"
            >
              {t('territory.sampleContent', lang)}
            </p>
          )}
          <ScreenStatus
            state={contentState}
            emptyKey="news.empty.title"
            onRetry={onRetryContent}
          />
          {contentState === 'ready' && (
            <>
              {scope && (
                <p className="-mb-2 font-body text-xs text-muted-foreground">
                  {t('territory.groupedIntro', lang)}
                </p>
              )}
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
                  <div role="alert">
                    <p className="font-body text-xs text-destructive">
                      {t('agenda.error', lang)}
                    </p>
                    <Button variant="bubbleLink" onClick={onRetryContent}>
                      {t('merchants.error.retry', lang)}
                    </Button>
                  </div>
                ) : promos.length === 0 ? (
                  <p className="font-body text-xs text-muted-foreground">
                    {t('agenda.empty.title', lang)}
                  </p>
                ) : (
                  <EventHeroCarousel promos={promos} onOpen={onOpenEvent} />
                )}
              </section>

              {scope && <HomeScopeNews scope={scope} />}

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
            </>
          )}
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

const HOME_NEWS_LIMIT = 2
const NEARBY_NEWS_LIMIT = 3

const HomeScopeNews = ({ scope }: { scope: HomeScopeProps }) => {
  const { lang } = useLang()
  if (scope.newsLoading)
    return <div aria-busy className="h-40 animate-pulse rounded-3xl bg-muted" />
  if (scope.newsError)
    return (
      <section role="alert" className="space-y-1">
        <SectionHeader
          title={tf('territory.newsFrom', lang, { town: scope.homeTownName })}
        />
        <p className="font-body text-xs text-destructive">
          {t('news.error.title', lang)}
        </p>
        <Button variant="bubbleLink" onClick={scope.reloadNews}>
          {t('merchants.error.retry', lang)}
        </Button>
      </section>
    )
  const unavailable = (name: string) => (
    <p key={name} className="font-body text-xs text-muted-foreground">
      {tf('territory.townUnavailable', lang, { town: name })}
    </p>
  )
  const showHome = scope.homeNews.length > 0 || scope.failedTownNames.home
  const showNearby =
    scope.nearbyNews.length > 0 || scope.failedTownNames.nearby.length > 0
  if (!showHome && !showNearby) return null
  return (
    <>
      {showHome && (
        <section className="space-y-3">
          <SectionHeader
            title={tf('territory.newsFrom', lang, { town: scope.homeTownName })}
            actionLabel={t('home.action.see_all_f', lang)}
            onAction={scope.onSeeAllNews}
          />
          {scope.failedTownNames.home && unavailable(scope.homeTownName)}
          {scope.homeNews.slice(0, HOME_NEWS_LIMIT).map(({ item }) => (
            <NoticiaCard
              key={item.id}
              variant="compact"
              noticia={item}
              lang={lang}
              onOpen={() => scope.onOpenNews(item.id)}
            />
          ))}
        </section>
      )}
      {showNearby && (
        <section className="space-y-3">
          <SectionHeader
            title={t('territory.nearYou', lang)}
            subtitle={scope.nearbyTownNames.join(' · ')}
          />
          {scope.failedTownNames.nearby.map(unavailable)}
          {scope.nearbyNews
            .slice(0, NEARBY_NEWS_LIMIT)
            .map(({ item, town }) => (
              <NoticiaCard
                key={item.id}
                variant="compact"
                noticia={item}
                lang={lang}
                town={{ name: town.name, isHome: false }}
                onOpen={() => scope.onOpenNews(item.id)}
              />
            ))}
        </section>
      )}
    </>
  )
}

export default HomeContent
