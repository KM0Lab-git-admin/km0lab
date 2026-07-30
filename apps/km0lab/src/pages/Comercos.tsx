import {
  t,
  useAuth,
  useNotifications,
  useMyShops,
  usePublicShops,
  usePublicTown,
  useAppStore,
} from '@km0lab/app'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  MapPin,
  ChevronDown,
  ScanLine,
  RefreshCw,
  Store,
  Check,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { CategoriaAdherit, ComercAdherit, Lang } from '@km0lab/app'

import BottomTabs from '@/components/BottomTabs'
import CategoryFilterSheet from '@/components/CategoryFilterSheet'
import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * Comerços — Llistat de comerços adherits.
 * Authed → GET /shops/for-me (amb estat d'escaneig).
 * Guest  → GET /shops/public (sense indicador ni filtre d'escaneig).
 * ───────────────────────────────────────────────────────────── */

type ScanFilter = 'all' | 'scanned' | 'pending'

const formatDistance = (m: number): string =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`

const interpolate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

/* ─── Card ──────────────────────────────────────────────────── */
interface CardProps {
  c: ComercAdherit
  lang: Lang
  showScanStatus: boolean
  onOpen: () => void
}
const ComercCard = ({ c, lang, showScanStatus, onOpen }: CardProps) => {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = Boolean(c.imatge) && !imgFailed
  const thumb = c.emoji ?? '🏪'

  return (
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
        <div className="relative shrink-0">
          <div
            className={cn(
              'w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden',
              c.bg ?? 'bg-km0-beige-100'
            )}
          >
            {showImage ? (
              <img
                src={c.imatge}
                alt=""
                loading="lazy"
                className="w-full h-full object-contain p-2"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="text-3xl" aria-hidden>
                {thumb}
              </span>
            )}
          </div>
          {showScanStatus && c.scanned === true && (
            <span
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-km0-teal-500 border-2 border-white flex items-center justify-center text-white"
              aria-label={t('merchants.card.scanned', lang)}
            >
              <Check size={14} strokeWidth={2.8} />
            </span>
          )}
          {showScanStatus && c.scanned === false && (
            <span
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-km0-beige-50 border-2 border-km0-blue-200 flex items-center justify-center"
              aria-label={t('merchants.card.not_scanned', lang)}
            />
          )}
        </div>

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
            {typeof c.distanciaM === 'number' && (
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
      </button>
    </motion.article>
  )
}

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

/* ─── Vista compartida ──────────────────────────────────────── */
interface ComercosViewProps {
  allItems: ComercAdherit[]
  categories: CategoriaAdherit[]
  apiLoading: boolean
  apiError: string | null
  reload: () => void
  isAuthed: boolean
  showScanStatus: boolean
}

const ComercosView = ({
  allItems,
  categories,
  apiLoading,
  apiError,
  reload,
  isAuthed,
  showScanStatus,
}: ComercosViewProps) => {
  const navigate = useNavigate()
  const { lang } = useLang()
  const town = useAppStore((s) => s.town)
  const { hasUnread, markAllSeen } = useNotifications()
  const { visitPoints } = usePublicTown()

  const goToHome = () => navigate('/home')
  const goToLogin = () => navigate('/login')
  const goToPoints = () => navigate('/points-history')
  const goToRewards = () => navigate('/redeemed-rewards')
  const goToProfile = () => navigate('/profile')
  const goToActions = () => navigate('/points-actions')

  const forced = new URLSearchParams(window.location.search).get('state')

  const [selected, setSelected] = useState('totes')
  const [scanFilter, setScanFilter] = useState<ScanFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [, setNotifOpen] = useState(false)

  const loading = forced === 'loading' || (forced !== 'error' && apiLoading)
  const error =
    forced === 'error' ? 'FORCED_ERROR' : forced === 'empty' ? null : apiError

  const items = useMemo<ComercAdherit[]>(() => {
    if (forced === 'empty') return []
    let rows = allItems
    if (showScanStatus && scanFilter === 'scanned') {
      rows = rows.filter((c) => c.scanned === true)
    } else if (showScanStatus && scanFilter === 'pending') {
      rows = rows.filter((c) => c.scanned !== true)
    }
    if (selected !== 'totes') {
      rows = rows.filter((c) => c.categoriaSlug === selected)
    }
    return rows
  }, [selected, scanFilter, forced, allItems, showScanStatus])

  const totalPrograma =
    categories.find((c) => c.slug === 'totes')?.count ?? allItems.length

  const selectedCat = categories.find((c) => c.slug === selected)
  const selectedLabel =
    selectedCat?.nom[lang === 'en' ? 'es' : lang] ??
    t('merchants.filter_all', lang)

  const openScanner = () => navigate('/scanner')

  const clearFilters = () => {
    setSelected('totes')
    setScanFilter('all')
  }

  const scanFilters: {
    id: ScanFilter
    labelKey:
      | 'merchants.scan_filter.all'
      | 'merchants.scan_filter.scanned'
      | 'merchants.scan_filter.pending'
  }[] = [
    { id: 'all', labelKey: 'merchants.scan_filter.all' },
    { id: 'scanned', labelKey: 'merchants.scan_filter.scanned' },
    { id: 'pending', labelKey: 'merchants.scan_filter.pending' },
  ]

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          <HomeHero
            cityName={town || 'Malgrat de Mar'}
            hasAlerts={hasUnread}
            onToggleAlerts={() => {
              setNotifOpen((v) => !v)
              markAllSeen()
            }}
            onBack={() => navigate('/home')}
            showGreeting={false}
          />

          <section className="relative flex-1 min-h-0 flex flex-col px-4 pt-3 pb-2 overflow-hidden">
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
                {interpolate(t('merchants.points_notice', lang), {
                  n: visitPoints,
                })}
              </p>
            </header>

            {showScanStatus && (
              <div
                className="shrink-0 mb-3 inline-flex rounded-full bg-km0-beige-200 p-0.5"
                role="group"
                aria-label={t('merchants.scan_filter.all', lang)}
              >
                {scanFilters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setScanFilter(f.id)}
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded-full font-ui text-[11px] font-bold transition-colors',
                      scanFilter === f.id
                        ? 'bg-km0-blue-800 text-white'
                        : 'text-km0-blue-800/70'
                    )}
                  >
                    {t(f.labelKey, lang)}
                  </button>
                ))}
              </div>
            )}

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

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-28">
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
                      onClick={() => reload()}
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
                      onClick={clearFilters}
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
                          showScanStatus={showScanStatus}
                          onOpen={() => navigate(`/merchants/${c.id}`)}
                        />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute left-0 right-0 bottom-0 z-20 px-4 pb-4 pt-4 bg-gradient-to-t from-km0-beige-50 via-km0-beige-50/95 to-transparent">
              <button
                type="button"
                onClick={openScanner}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-km0-blue-800 text-white font-ui text-sm font-bold shadow-lg shadow-km0-blue-800/30 active:scale-[0.99] transition-transform"
              >
                <ScanLine size={18} strokeWidth={2.4} />
                {interpolate(t('merchant.cta.scan_earn', lang), {
                  n: visitPoints,
                })}
              </button>
            </div>
          </section>

          <CategoryFilterSheet
            open={filterOpen}
            onOpenChange={setFilterOpen}
            categories={categories}
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

const ComercosAuthed = () => {
  const {
    items: allItems,
    categories,
    loading: apiLoading,
    error: apiError,
    reload,
  } = useMyShops()

  return (
    <ComercosView
      allItems={allItems}
      categories={categories}
      apiLoading={apiLoading}
      apiError={apiError}
      reload={reload}
      isAuthed
      showScanStatus
    />
  )
}

const ComercosGuest = () => {
  const {
    items: allItems,
    categories,
    loading: apiLoading,
    error: apiError,
    reload,
  } = usePublicShops()

  return (
    <ComercosView
      allItems={allItems}
      categories={categories}
      apiLoading={apiLoading}
      apiError={apiError}
      reload={reload}
      isAuthed={false}
      showScanStatus={false}
    />
  )
}

const Comercos = () => {
  const { user } = useAuth()
  return user ? <ComercosAuthed /> : <ComercosGuest />
}

export default Comercos
