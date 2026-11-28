import type { Town, ComercAdherit, CategoriaAdherit } from '@km0lab/app'
import {
  useNotificationsPanel,
  useLocationContext,
  useDragScroll,
  usePointsConfig,
  useTerritory,
  usePreviewState,
  filterShops,
  useAuth,
  t,
  tf,
  type Lang,
  useShops,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion, AnimatePresence } from 'framer-motion'

import {
  Search,
  QrCode,
  MapPin,
  ScanLine,
  X,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomTabs from '@/components/AccountBottomTabs'
import CategoryFilterMenu, {
  type CategoryFilterOption,
} from '@/components/CategoryFilterMenu'
import NotificationBell from '@/components/NotificationBell'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import ScreenHeader from '@/components/ScreenHeader'
import SectionHeader from '@/components/SectionHeader'
import { TownTag } from '@/components/TownTag'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * Comerços — Llistat de comerços adherits al programa de punts.
 *
 * MOCK: totes les dades locals (`data/comerciosAdheridos.ts`).
 * Estats forçables per query param: ?state=loading|empty|error
 * ───────────────────────────────────────────────────────────── */

const formatDistance = (m: number): string =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`

const interpolate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

/* ─── Card ──────────────────────────────────────────────────── */
interface CardProps {
  c: ComercAdherit
  lang: Lang
  onOpen: () => void
  town?: Town
  isHome?: boolean
}
const ComercCard = ({ c, lang, onOpen, town, isHome = false }: CardProps) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-km0-blue-100 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
  >
    <Button
      variant="bubbleSurface"
      type="button"
      onClick={onOpen}
      className="h-auto w-full whitespace-normal text-left flex items-stretch justify-start gap-3 p-3"
    >
      {/* Miniatura */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden',
            c.bg ?? 'bg-km0-beige-100'
          )}
        >
          {c.imatge ? (
            <img
              src={c.imatge}
              alt=""
              loading="lazy"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.hidden = true
              }}
            />
          ) : (
            <span className="text-3xl" aria-hidden>
              {c.emoji ?? '🏪'}
            </span>
          )}
        </div>
        {/* Segell adherit */}
        <span
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-km0-teal-500 border-2 border-card flex items-center justify-center text-primary-foreground"
          aria-label={t('merchants.card.member', lang)}
        >
          <BadgeCheck size={14} strokeWidth={2.6} />
        </span>
      </div>

      {/* Cos */}
      <div className="flex-1 min-w-0 flex flex-col">
        {town && (
          <div className="mb-1 flex">
            <TownTag townName={town.name} isHome={isHome} lang={lang} />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-ui text-[10px] font-bold uppercase tracking-wide text-km0-teal-600 mb-0.5 truncate">
              {c.categoriaNom[lang === 'en' ? 'es' : lang]}
            </p>
            <h3 className="font-brand text-sm leading-tight text-km0-blue-900 truncate">
              {c.nom}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-ui text-km0-blue-700/70 truncate">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{c.adreca}</span>
            </p>
          </div>
          {c.distanciaM !== null && (
            <span className="shrink-0 font-ui text-[10px] text-km0-blue-700/60 pt-0.5">
              {formatDistance(c.distanciaM)}
            </span>
          )}
        </div>

        {c.teQR && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-km0-blue-50 text-km0-blue-800 text-[10px] font-ui font-bold flex items-center gap-1 border border-km0-blue-100">
              <QrCode size={10} strokeWidth={2.4} />
              {t('merchants.card.qr', lang)}
            </span>
          </div>
        )}
      </div>
    </Button>
  </motion.article>
)

/* ─── Skeleton ──────────────────────────────────────────────── */
const CardSkeleton = () => (
  <div className="bg-card border border-km0-blue-100 rounded-2xl p-3 flex gap-3 animate-pulse">
    <div className="w-20 h-20 rounded-xl bg-km0-blue-100/60 shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3 w-1/3 bg-km0-blue-100/60 rounded" />
      <div className="h-4 w-2/3 bg-km0-blue-100/60 rounded" />
      <div className="h-3 w-1/2 bg-km0-blue-100/50 rounded" />
      <div className="h-4 w-24 bg-km0-blue-100/50 rounded-full" />
    </div>
  </div>
)

/* ─── Pàgina ────────────────────────────────────────────────── */
const Comercos = () => {
  const pointsConfig = usePointsConfig()
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const notifications = useNotificationsPanel()
  const { town } = useLocationContext()
  const scrollRef = useDragScroll('vertical')
  const isAuthed = !!user
  const goToHome = () => navigate('/home')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/points-history')
  const goToRewards = () => navigate('/redeemed-rewards')
  const goToProfile = () => navigate('/profile')
  const goToActions = () => navigate('/points-actions')

  const { shops, categories, loading, error, reload } = useShops()
  const { territory, homeTown, isGrouped } = useTerritory()
  const [selected, setSelected] = useState('totes')
  const [selectedTown, setSelectedTown] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  useEffect(() => {
    setSelectedTown(null)
    setSearch('')
  }, [territory?.scopeId, territory?.homeTownId])

  const items = useMemo<ComercAdherit[]>(() => {
    return filterShops(shops, {
      category: selected,
      townId: selectedTown,
      search,
    })
  }, [selected, shops, selectedTown, search])
  const { state, isSample, retry } = usePreviewState(
    loading,
    error !== null,
    items.length === 0
  )
  const homeItems = items.filter((shop) => shop.townId === homeTown?.id)
  const nearbyItems = items.filter((shop) => shop.townId !== homeTown?.id)
  const renderList = (list: ComercAdherit[], showTown: boolean) => (
    <ul className="space-y-2">
      {list.map((c) => (
        <li key={c.id}>
          <ComercCard
            c={c}
            lang={lang}
            town={
              showTown
                ? territory?.towns.find((origin) => origin.id === c.townId)
                : undefined
            }
            isHome={c.townId === homeTown?.id}
            onOpen={() => navigate(`/merchants/${c.id}`)}
          />
        </li>
      ))}
    </ul>
  )

  const totalPrograma = shops.length

  const selectedCat = categories.find((c) => c.slug === selected)
  const selectedLabel =
    selectedCat?.nom[lang === 'en' ? 'es' : lang] ??
    t('merchants.filter_all', lang)

  const toOption = (c: CategoriaAdherit): CategoryFilterOption => ({
    key: c.slug,
    label: c.nom[lang === 'en' ? 'es' : lang],
    icon: <span className="text-base">{c.emoji ?? '🏷️'}</span>,
    count:
      c.slug === 'totes'
        ? shops.length
        : shops.filter((shop) => shop.categoriaSlug === c.slug).length,
  })
  const allCategory: CategoriaAdherit = categories.find(
    (c) => c.slug === 'totes'
  ) ?? {
    slug: 'totes',
    nom: {
      ca: t('merchants.filter_all', 'ca'),
      es: t('merchants.filter_all', 'es'),
    },
    count: shops.length,
    emoji: '🗂️',
  }

  const openScanner = () => navigate('/scanner')

  return (
    <>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div
          ref={notifications.setContainer}
          className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50"
        >
          <ScreenHeader
            title={t('merchants.header.title', lang)}
            subtitle={
              isGrouped
                ? tf('territory.townAndNeighbours', lang, {
                    town: homeTown?.name ?? town,
                  })
                : town
            }
            onBack={() => navigate('/home')}
            backAriaLabel={t('common.back', lang)}
            actions={
              <NotificationBell
                hasAlerts={notifications.hasUnread}
                onClick={notifications.show}
                ariaLabel={t(
                  notifications.hasUnread
                    ? 'notifications.unread'
                    : 'notifications.none',
                  lang
                )}
              />
            }
          />

          {/* Body */}
          <section className="relative flex-1 min-h-0 flex flex-col px-4 pt-3 pb-2 overflow-hidden">
            {/* Títol + subtítol */}
            <header className="shrink-0 mb-3">
              <p className="font-ui text-xs text-km0-blue-700/70 mt-0.5">
                {interpolate(t('merchants.subtitle', lang), {
                  count: totalPrograma,
                })}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-km0-coral-500 text-primary-foreground text-[11px] font-ui font-bold">
                <QrCode size={12} strokeWidth={2.4} />
                {interpolate(t('merchants.points_notice', lang), {
                  n: pointsConfig.scan,
                })}
              </p>
            </header>

            {isSample && (
              <p
                role="status"
                className="mb-2 shrink-0 font-ui text-xs font-bold text-km0-coral-700"
              >
                {t('territory.sampleContent', lang)}
              </p>
            )}
            {isGrouped && (
              <label className="mb-3 flex shrink-0 items-center gap-2 rounded-xl border border-km0-blue-100 bg-card px-3">
                <Search
                  size={16}
                  aria-hidden
                  className="shrink-0 text-km0-blue-700"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label={t('merchants.search', lang)}
                  placeholder={t('merchants.search', lang)}
                  className="h-10 min-w-0 flex-1 bg-transparent font-ui text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
            )}
            {/* Filtre + comptador */}
            <div className="relative z-20 shrink-0 flex items-center justify-between gap-2 mb-3">
              <span className="min-w-0 truncate font-ui text-sm font-bold text-km0-blue-900">
                {selectedLabel}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-ui text-[11px] font-bold text-km0-blue-700 whitespace-nowrap">
                  {interpolate(t('merchants.results_count', lang), {
                    count: items.length,
                  })}
                </span>
                <CategoryFilterMenu
                  title={t('merchants.filter_by_category', lang)}
                  allOption={toOption(allCategory)}
                  options={categories
                    .filter((c) => c.slug !== 'totes')
                    .map(toOption)}
                  selected={selected === 'totes' ? [] : [selected]}
                  onToggle={setSelected}
                  onClear={() => setSelected('totes')}
                />
                {isGrouped && (
                  <CategoryFilterMenu
                    title={t('territory.townFilter', lang)}
                    icon={<MapPin aria-hidden className="!h-4 !w-4" />}
                    allOption={{
                      key: 'all',
                      label: t('territory.allTowns', lang),
                      icon: <MapPin size={16} />,
                    }}
                    options={
                      territory?.towns.map((origin) => ({
                        key: origin.id,
                        label: origin.name,
                        icon: <MapPin size={16} />,
                        isHome: origin.id === homeTown?.id,
                      })) ?? []
                    }
                    selected={selectedTown ? [selectedTown] : []}
                    onToggle={setSelectedTown}
                    onClear={() => setSelectedTown(null)}
                  />
                )}
              </div>
            </div>

            {/* Llista */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-24"
              ref={scrollRef}
            >
              <AnimatePresence mode="wait">
                {state === 'loading' ? (
                  <motion.div
                    key="loading"
                    aria-busy="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : state === 'error' ? (
                  <motion.div
                    key="error"
                    role="alert"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 mx-auto max-w-xs text-center bg-card border border-km0-coral-100 rounded-2xl p-5"
                  >
                    <p className="font-brand text-sm text-km0-blue-900 mb-3">
                      {t('merchants.error.title', lang)}
                    </p>
                    <Button
                      variant="bubbleSurface"
                      type="button"
                      onClick={() => retry(reload)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-coral-500 text-primary-foreground font-ui text-xs font-bold active:scale-95 transition-transform"
                    >
                      <RefreshCw size={12} />
                      {t('merchants.error.retry', lang)}
                    </Button>
                  </motion.div>
                ) : state === 'empty' ? (
                  <motion.div
                    key="empty"
                    role="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 mx-auto max-w-xs text-center bg-card border border-km0-blue-100 rounded-2xl p-5"
                  >
                    <p className="text-3xl mb-2" aria-hidden>
                      🏪
                    </p>
                    <p className="font-brand text-sm text-km0-blue-900 mb-3">
                      {t('merchants.empty.title', lang)}
                    </p>
                    <Button
                      variant="bubbleSurface"
                      type="button"
                      onClick={() => {
                        setSelected('totes')
                        setSelectedTown(null)
                        setSearch('')
                        retry(reload)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-blue-700 text-primary-foreground font-ui text-xs font-bold active:scale-95 transition-transform"
                    >
                      <X size={12} />
                      {t('merchants.empty.clear', lang)}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {isGrouped && selectedTown === null ? (
                      <>
                        {homeItems.length > 0 && (
                          <section className="space-y-3">
                            <SectionHeader
                              title={tf('territory.discover', lang, {
                                town: homeTown?.name ?? town,
                              })}
                              aside={
                                <TownTag
                                  townName={homeTown?.name ?? town}
                                  isHome
                                  lang={lang}
                                />
                              }
                            />
                            {renderList(homeItems, false)}
                          </section>
                        )}
                        {nearbyItems.length > 0 && (
                          <section className="space-y-3">
                            <SectionHeader
                              title={t('territory.alsoNearYou', lang)}
                            />
                            {renderList(nearbyItems, true)}
                          </section>
                        )}
                      </>
                    ) : (
                      renderList(items, isGrouped)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAB escàner (centrat sobre la tab bar) */}
            <Button
              variant="bubbleSurface"
              type="button"
              onClick={openScanner}
              aria-label={t('merchants.fab.scan', lang)}
              className="absolute left-1/2 -translate-x-1/2 bottom-3 w-14 h-14 rounded-full bg-km0-teal-500 text-primary-foreground shadow-lg shadow-km0-teal-500/40 flex items-center justify-center active:scale-95 transition-transform z-20 border-4 border-km0-beige-50"
            >
              <ScanLine size={24} strokeWidth={2.4} />
            </Button>
          </section>

          <NotificationsOverlay
            open={notifications.open}
            items={notifications.items}
            loading={notifications.loading}
            error={notifications.error}
            lang={lang}
            onClose={notifications.close}
            onReload={notifications.reload}
            container={notifications.container}
          />
          <BottomTabs
            activeTab="home"
            isAuthed={isAuthed}
            onLogin={goToLogin}
            onHome={goToHome}
            onProfile={goToProfile}
            onPoints={goToPoints}
            onRewards={goToRewards}
            onActions={goToActions}
          />
        </div>
      </div>
    </>
  )
}

export default Comercos
