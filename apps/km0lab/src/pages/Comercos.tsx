import {
  useNotificationsPanel,
  useLocationContext,
  useDragScroll,
  usePointsConfig,
  useAuth,
  t,
  type Lang,
  useShops,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  MapPin,
  ScanLine,
  X,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ComercAdherit, CategoriaAdherit } from '@km0lab/app'

import BottomTabs from '@/components/AccountBottomTabs'
import CategoryFilterMenu, {
  type CategoryFilterOption,
} from '@/components/CategoryFilterMenu'
import HomeHero from '@/components/HomeHero'
import NotificationsOverlay from '@/components/NotificationsOverlay'
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
}
const ComercCard = ({ c, lang, onOpen }: CardProps) => (
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
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
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
  const [selected, setSelected] = useState('totes')

  const items = useMemo<ComercAdherit[]>(() => {
    if (selected === 'totes') return shops
    return shops.filter((c) => c.categoriaSlug === selected)
  }, [selected, shops])

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
          <HomeHero
            cityName={town}
            hasAlerts={notifications.hasUnread}
            onToggleAlerts={notifications.show}
            onBack={() => navigate('/home')}
            showGreeting={false}
          />

          {/* Body */}
          <section className="relative flex-1 min-h-0 flex flex-col px-4 pt-3 pb-2 overflow-hidden">
            {/* Títol + subtítol */}
            <header className="shrink-0 mb-3">
              <h2 className="font-brand text-lg leading-tight text-km0-blue-900">
                {t('merchants.title', lang)}
              </h2>
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
              </div>
            </div>

            {/* Llista */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-24"
              ref={scrollRef}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
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
                      onClick={reload}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-coral-500 text-primary-foreground font-ui text-xs font-bold active:scale-95 transition-transform"
                    >
                      <RefreshCw size={12} />
                      {t('merchants.error.retry', lang)}
                    </Button>
                  </motion.div>
                ) : items.length === 0 ? (
                  <motion.div
                    key="empty"
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
                      onClick={() => setSelected('totes')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-blue-700 text-primary-foreground font-ui text-xs font-bold active:scale-95 transition-transform"
                    >
                      <X size={12} />
                      {t('merchants.empty.clear', lang)}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.ul
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {items.map((c) => (
                      <li key={c.id}>
                        <ComercCard
                          c={c}
                          lang={lang}
                          onOpen={() => navigate(`/merchants/${c.id}`)}
                        />
                      </li>
                    ))}
                  </motion.ul>
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
