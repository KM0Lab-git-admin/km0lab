import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  MapPin,
  ChevronDown,
  ScanLine,
  X,
  RefreshCw,
  Store,
  BadgeCheck,
} from 'lucide-react'

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import BottomTabs from '@/components/BottomTabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@km0lab/ui'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@km0lab/app'
import { useNotifications } from '@km0lab/app'
import { t, type Lang } from '@km0lab/app'
import { cn } from '@/lib/utils'
import {
  COMERCIOS_ADHERITS,
  CATEGORIES_ADHERITS,
} from '@/data/comerciosAdheridos'
import type { ComercAdherit, CategoriaAdherit } from '@km0lab/app'

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
    className="bg-white border border-km0-blue-100 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
  >
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left flex items-stretch gap-3 p-3"
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
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-km0-teal-500 border-2 border-white flex items-center justify-center text-white"
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
          <span className="shrink-0 font-ui text-[10px] text-km0-blue-700/60 pt-0.5">
            {formatDistance(c.distanciaM)}
          </span>
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
    </button>
  </motion.article>
)

/* ─── Skeleton ──────────────────────────────────────────────── */
const CardSkeleton = () => (
  <div className="bg-white border border-km0-blue-100 rounded-2xl p-3 flex gap-3 animate-pulse">
    <div className="w-20 h-20 rounded-xl bg-km0-blue-100/60 shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3 w-1/3 bg-km0-blue-100/60 rounded" />
      <div className="h-4 w-2/3 bg-km0-blue-100/60 rounded" />
      <div className="h-3 w-1/2 bg-km0-blue-100/50 rounded" />
      <div className="h-4 w-24 bg-km0-blue-100/50 rounded-full" />
    </div>
  </div>
)

/* ─── Filtre sheet ──────────────────────────────────────────── */
interface FilterProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  categories: CategoriaAdherit[]
  selected: string
  onSelect: (slug: string) => void
  lang: Lang
}
const CategorySheet = ({
  open,
  onOpenChange,
  categories,
  selected,
  onSelect,
  lang,
}: FilterProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      className="max-h-[75vh] rounded-t-3xl p-0 flex flex-col bg-white"
    >
      <SheetHeader className="p-4 border-b border-km0-blue-100 text-left">
        <SheetTitle className="font-brand text-base text-km0-blue-900">
          {t('merchants.filter_by_category', lang)}
        </SheetTitle>
      </SheetHeader>
      <ul className="flex-1 min-h-0 overflow-y-auto py-1">
        {categories.map((cat) => {
          const isSelected = cat.slug === selected
          const label = cat.nom[lang === 'en' ? 'es' : lang]
          return (
            <li key={cat.slug}>
              <button
                type="button"
                onClick={() => {
                  onSelect(cat.slug)
                  onOpenChange(false)
                }}
                aria-pressed={isSelected}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'bg-km0-blue-50 text-km0-blue-900'
                    : 'hover:bg-km0-beige-50 text-km0-blue-800'
                )}
              >
                <span className="w-6 text-lg" aria-hidden>
                  {cat.emoji ?? '🏷️'}
                </span>
                <span
                  className={cn(
                    'flex-1 font-ui text-sm',
                    isSelected && 'font-bold'
                  )}
                >
                  {label}
                </span>
                <span className="text-[11px] font-ui text-km0-blue-700/60 tabular-nums">
                  {cat.count}
                </span>
                <span
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    isSelected
                      ? 'border-km0-teal-500 bg-km0-teal-500'
                      : 'border-km0-blue-200'
                  )}
                  aria-hidden
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </SheetContent>
  </Sheet>
)

/* ─── Pàgina ────────────────────────────────────────────────── */
const Comercos = () => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { user } = useAuth()
  const { hasUnread, markAllSeen } = useNotifications()
  const isAuthed = !!user
  const goToHome = () => navigate('/home')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/points-history')
  const goToRewards = () => navigate('/redeemed-rewards')
  const goToProfile = () => navigate('/profile')
  const goToActions = () => navigate('/points-actions')

  const forced = new URLSearchParams(window.location.search).get('state')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState('totes')
  const [filterOpen, setFilterOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    if (forced === 'loading') {
      setLoading(true)
      return
    }
    if (forced === 'error') {
      setLoading(false)
      setError('FORCED_ERROR')
      return
    }
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [forced])

  const items = useMemo<ComercAdherit[]>(() => {
    if (forced === 'empty') return []
    if (selected === 'totes') return COMERCIOS_ADHERITS
    return COMERCIOS_ADHERITS.filter((c) => c.categoriaSlug === selected)
  }, [selected, forced])

  const totalPrograma =
    CATEGORIES_ADHERITS.find((c) => c.slug === 'totes')?.count ??
    COMERCIOS_ADHERITS.length

  const selectedCat = CATEGORIES_ADHERITS.find((c) => c.slug === selected)
  const selectedLabel =
    selectedCat?.nom[lang === 'en' ? 'es' : lang] ??
    t('merchants.filter_all', lang)

  const openScanner = () => navigate('/scanner')

  const retry = () => {
    setError(null)
    setLoading(true)
    setTimeout(() => setLoading(false), 400)
  }

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          <HomeHero
            cityName="Malgrat de Mar"
            hasAlerts={hasUnread}
            onToggleAlerts={() => {
              setNotifOpen((v) => !v)
              markAllSeen()
            }}
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
              <p className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-km0-coral-500 text-white text-[11px] font-ui font-bold">
                <QrCode size={12} strokeWidth={2.4} />
                {interpolate(t('merchants.points_notice', lang), { n: 20 })}
              </p>
            </header>

            {/* Filtre + comptador */}
            <div className="shrink-0 flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-km0-blue-100 shadow-sm active:scale-[0.99] transition-transform"
                aria-haspopup="dialog"
                aria-expanded={filterOpen}
              >
                <span className="text-km0-blue-700" aria-hidden>
                  <Store size={16} strokeWidth={2.2} />
                </span>
                <span className="flex-1 min-w-0 truncate text-left font-ui text-sm text-km0-blue-900 font-bold">
                  {selectedLabel}
                </span>
                <ChevronDown size={16} className="text-km0-blue-700 shrink-0" />
              </button>
              <span className="shrink-0 font-ui text-[11px] font-bold text-km0-blue-700 whitespace-nowrap">
                {interpolate(t('merchants.results_count', lang), {
                  count: items.length,
                })}
              </span>
            </div>

            {/* Llista */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-24"
              style={{ WebkitOverflowScrolling: 'touch' }}
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
                    className="mt-8 mx-auto max-w-xs text-center bg-white border border-km0-coral-100 rounded-2xl p-5"
                  >
                    <p className="font-brand text-sm text-km0-blue-900 mb-3">
                      {t('merchants.error.title', lang)}
                    </p>
                    <button
                      type="button"
                      onClick={retry}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-coral-500 text-white font-ui text-xs font-bold active:scale-95 transition-transform"
                    >
                      <RefreshCw size={12} />
                      {t('merchants.error.retry', lang)}
                    </button>
                  </motion.div>
                ) : items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 mx-auto max-w-xs text-center bg-white border border-km0-blue-100 rounded-2xl p-5"
                  >
                    <p className="text-3xl mb-2" aria-hidden>
                      🏪
                    </p>
                    <p className="font-brand text-sm text-km0-blue-900 mb-3">
                      {t('merchants.empty.title', lang)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelected('totes')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-blue-700 text-white font-ui text-xs font-bold active:scale-95 transition-transform"
                    >
                      <X size={12} />
                      {t('merchants.empty.clear', lang)}
                    </button>
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
            <button
              type="button"
              onClick={openScanner}
              aria-label={t('merchants.fab.scan', lang)}
              className="absolute left-1/2 -translate-x-1/2 bottom-3 w-14 h-14 rounded-full bg-km0-teal-500 text-white shadow-lg shadow-km0-teal-500/40 flex items-center justify-center active:scale-95 transition-transform z-20 border-4 border-km0-beige-50"
            >
              <ScanLine size={24} strokeWidth={2.4} />
            </button>
          </section>

          <CategorySheet
            open={filterOpen}
            onOpenChange={setFilterOpen}
            categories={CATEGORIES_ADHERITS}
            selected={selected}
            onSelect={setSelected}
            lang={lang}
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
    </DeviceShell>
  )
}

export default Comercos
