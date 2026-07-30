import {
  toComercDetall,
  useAppStore,
  useNotifications,
  usePointsHistory,
  usePublicShops,
  usePublicTown,
  useShopPromotions,
  weekHoursRows,
  t,
  type ComercDetall,
  type Lang,
  type OpeningHoursOut,
  type PromocioInfo,
  type ShopPromotion,
} from '@km0lab/app'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  ScanLine,
  Tag,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * ComercDetall — Fitxa del comerç (GET /shops/public by id).
 * ───────────────────────────────────────────────────────────── */

const interpolate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

const langKey = (lang: Lang): 'ca' | 'es' => (lang === 'en' ? 'es' : lang)

const formatDistance = (m: number): string =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`

const toPromocioInfo = (p: ShopPromotion): PromocioInfo => ({
  id: p.id,
  etiqueta: p.label,
  titol: { ca: p.title, es: p.title },
  detall: { ca: p.detail, es: p.detail },
  condicio: p.conditions ? { ca: p.conditions, es: p.conditions } : undefined,
})

/* ─── Horari setmanal ───────────────────────────────────────── */
const OpeningHoursWeek = ({
  hours,
  lang,
}: {
  hours: OpeningHoursOut
  lang: Lang
}) => {
  const rows = weekHoursRows(hours, lang)
  return (
    <div className="mt-2 rounded-2xl bg-white border border-km0-blue-100 px-4 py-3 shadow-sm">
      <ul className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className={cn(
              'flex items-baseline justify-between gap-3 font-body text-sm',
              row.isToday
                ? 'font-ui font-bold text-km0-blue-900'
                : 'text-km0-blue-800/70'
            )}
          >
            <span>{row.label}</span>
            <span className="tabular-nums text-right">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Header imatge ─────────────────────────────────────────── */
const HeroImage = ({ c, lang }: { c: ComercDetall; lang: Lang }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = Boolean(c.imatge) && !imgFailed

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden bg-km0-beige-100">
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          c.bg ?? 'bg-km0-beige-100'
        )}
      >
        {showImage ? (
          <img
            src={c.imatge}
            alt={c.nom}
            className="w-full h-full object-contain p-8"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="text-7xl" aria-hidden>
            {c.emoji ?? '🏪'}
          </span>
        )}
      </div>
      {c.visitat && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-km0-teal-500 text-white font-ui text-[11px] font-bold shadow-md">
          <CheckCircle2 size={12} strokeWidth={2.6} />
          {t('merchant.badge.visited', lang)}
        </span>
      )}
    </div>
  )
}

/* ─── Tarjeta de punts ──────────────────────────────────────── */
const PointsCard = ({
  c,
  lang,
  onScan,
}: {
  c: ComercDetall
  lang: Lang
  onScan: () => void
}) => {
  if (c.visitat) {
    // Mock: última visita fa 5 dies, cooldown de 30 dies per tornar a guanyar punts
    const COOLDOWN_DAYS = 30
    const DAYS_SINCE = 5
    const lastScan = new Date(Date.now() - DAYS_SINCE * 24 * 60 * 60 * 1000)
    const lastScanFmt = lastScan.toLocaleDateString(
      lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : 'ca-ES',
      { day: '2-digit', month: '2-digit', year: 'numeric' }
    )
    const daysLeft = Math.max(0, COOLDOWN_DAYS - DAYS_SINCE)
    const daysLeftLabel =
      daysLeft === 1
        ? t('merchant.points.days_left_one', lang)
        : interpolate(t('merchant.points.days_left', lang), { n: daysLeft })
    return (
      <div className="rounded-2xl border border-km0-teal-200 bg-km0-teal-50 p-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-12 h-12 rounded-xl bg-km0-teal-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 size={24} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-brand text-base text-km0-teal-700 leading-tight">
                {interpolate(t('merchant.points.done_title', lang), {
                  n: c.punts,
                })}
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-km0-teal-500 text-white font-ui text-[10px] font-bold uppercase tracking-wide">
                <CheckCircle2 size={10} strokeWidth={2.8} />
                {t('merchant.points.in_list', lang)}
              </span>
            </div>
            <p className="font-ui text-xs text-km0-blue-800/80 mt-1">
              {interpolate(t('merchant.points.last_scan', lang), {
                date: lastScanFmt,
              })}
            </p>
          </div>
        </div>
        <div className="mt-3 border-t border-km0-teal-200/70 pt-2 space-y-1.5">
          <p className="font-ui text-[11px] leading-snug text-km0-blue-800/75">
            {t('merchant.points.done_note', lang)}
          </p>
          <p className="flex items-center gap-1.5 font-ui text-[11px] font-bold text-km0-blue-800">
            <Clock size={12} strokeWidth={2.4} className="text-km0-teal-600" />
            {daysLeftLabel}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-km0-blue-800 p-4 shadow-md">
      {/* Estrella decorativa */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 -bottom-3 text-km0-blue-700/60 text-[110px] leading-none select-none"
      >
        ★
      </span>
      <div className="relative flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-km0-blue-700 text-white flex items-center justify-center">
          <ScanLine size={20} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-brand text-base text-white leading-tight">
            {interpolate(t('merchant.points.earn_title', lang), { n: c.punts })}
          </p>
          <p className="font-ui text-xs text-white/80 mt-1">
            {t('merchant.points.earn_subtitle', lang)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onScan}
        className="relative mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-km0-yellow-400 text-km0-blue-900 font-ui text-sm font-bold active:scale-[0.98] transition-transform"
      >
        <ScanLine size={16} strokeWidth={2.4} />
        {t('merchant.points.scan_cta', lang)}
      </button>
      <p className="relative mt-2 text-center font-ui text-[11px] text-white/70">
        {t('merchant.points.earn_subtitle', lang)}
      </p>
    </div>
  )
}

/* ─── Fila d'info ───────────────────────────────────────────── */
const InfoRow = ({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  action?: React.ReactNode
}) => (
  <div className="flex items-start gap-3 py-3">
    <span className="shrink-0 w-9 h-9 rounded-full bg-km0-beige-200 text-km0-blue-800 flex items-center justify-center">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <div className="font-ui text-sm font-bold text-km0-blue-900 leading-snug break-words">
        {value}
      </div>
      <p className="font-ui text-xs text-km0-blue-700/70 mt-0.5">{label}</p>
    </div>
    {action && <div className="shrink-0 self-center">{action}</div>}
  </div>
)

/* ─── Promo card ────────────────────────────────────────────── */
const PromoRow = ({ p, lang }: { p: PromocioInfo; lang: Lang }) => {
  const k = langKey(lang)
  const pill = p.condicio?.[k] ?? 'Info'
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="shrink-0 min-w-[46px] h-10 px-2 rounded-lg bg-km0-yellow-400 text-km0-blue-900 flex items-center justify-center font-brand font-black text-xs">
        {p.etiqueta}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-ui text-sm font-bold text-km0-blue-900 leading-tight">
          {p.titol[k]}
        </p>
        <p className="font-ui text-xs text-km0-blue-700/80 mt-0.5">
          {p.detall[k]}
        </p>
      </div>
      <span className="shrink-0 px-2.5 py-1 rounded-full bg-km0-coral-100 text-km0-coral-500 font-ui text-[11px] font-bold">
        {pill}
      </span>
    </li>
  )
}

/* ─── Skeleton ──────────────────────────────────────────────── */
const DetailSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="w-full aspect-[16/10] bg-km0-blue-100/50" />
    <div className="px-4 space-y-3">
      <div className="h-3 w-20 bg-km0-blue-100/60 rounded" />
      <div className="h-5 w-2/3 bg-km0-blue-100/60 rounded" />
      <div className="h-3 w-1/2 bg-km0-blue-100/50 rounded" />
      <div className="h-24 w-full bg-km0-blue-100/40 rounded-2xl" />
      <div className="h-40 w-full bg-km0-blue-100/40 rounded-2xl" />
    </div>
  </div>
)

/* ─── Pàgina ────────────────────────────────────────────────── */
const ComercDetallPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const { lang } = useLang()
  const { hasUnread, markAllSeen } = useNotifications()
  const town = useAppStore((s) => s.town)
  const {
    shops,
    loading: shopsLoading,
    error: shopsError,
    reload,
  } = usePublicShops()
  const { visitPoints } = usePublicTown()
  const { promotions } = useShopPromotions()
  const { history } = usePointsHistory()
  const [, setNotifOpen] = useState(false)
  const forced = params.get('state')

  // Shops ja escanejats per l'usuari (del ledger real, type === 'scan').
  const visitedShopNames = useMemo(() => {
    const names = new Set<string>()
    for (const it of history.items) {
      if (it.type === 'scan' && it.place)
        names.add(it.place.trim().toLowerCase())
    }
    return names
  }, [history.items])

  const shopPromos = useMemo(
    () =>
      id ? promotions.filter((p) => p.shopId === id).map(toPromocioInfo) : [],
    [promotions, id]
  )

  const comerc = useMemo<ComercDetall | undefined>(() => {
    if (!id) return undefined
    const shop = shops.find((s) => s.id === id)
    if (!shop) return undefined
    const visitat = visitedShopNames.has(shop.name.trim().toLowerCase())
    const base = toComercDetall(shop, lang, {
      visitat,
      promocions: shopPromos,
    })
    // Puntos por escaneo QR: regla del town (GET /towns/public).
    return { ...base, punts: visitPoints }
  }, [id, shops, visitedShopNames, lang, shopPromos, visitPoints])

  const loading = forced === 'loading' || (forced !== 'error' && shopsLoading)
  const isError = forced === 'error' || Boolean(shopsError)
  const k = langKey(lang)
  const goBack = () => navigate('/merchants')
  const openScanner = () => navigate('/scanner')

  const stateOpen = comerc?.obertAra
    ? t('merchant.status.open', lang)
    : t('merchant.status.closed', lang)

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          <HomeHero
            cityName={town || comerc?.poblacio || 'Malgrat de Mar'}
            hasAlerts={hasUnread}
            onToggleAlerts={() => {
              setNotifOpen((v) => !v)
              markAllSeen()
            }}
            onBack={goBack}
            backAriaLabel={t('merchant.back', lang)}
            showGreeting={false}
          />

          <section className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-28">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DetailSkeleton />
                </motion.div>
              ) : isError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 mx-4 text-center bg-white border border-km0-coral-100 rounded-2xl p-5"
                >
                  <p className="font-brand text-sm text-km0-blue-900 mb-3">
                    {t('merchant.error.title', lang)}
                  </p>
                  <button
                    type="button"
                    onClick={() => reload()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-coral-500 text-white font-ui text-xs font-bold active:scale-95 transition-transform"
                  >
                    <RefreshCw size={12} />
                    {t('merchant.error.retry', lang)}
                  </button>
                </motion.div>
              ) : !comerc ? (
                <motion.div
                  key="notfound"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 mx-4 text-center bg-white border border-km0-blue-100 rounded-2xl p-5"
                >
                  <p className="text-3xl mb-2" aria-hidden>
                    🏪
                  </p>
                  <p className="font-brand text-sm text-km0-blue-900 mb-3">
                    {t('merchant.notfound.title', lang)}
                  </p>
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-km0-blue-700 text-white font-ui text-xs font-bold active:scale-95 transition-transform"
                  >
                    {t('merchant.notfound.back', lang)}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <HeroImage c={comerc} lang={lang} />

                  <header className="px-4">
                    <p className="font-ui text-[11px] uppercase tracking-wide font-bold text-km0-teal-600">
                      {comerc.categoria[k]}
                      {comerc.subcategoria && (
                        <>
                          <span className="mx-1 opacity-50">·</span>
                          {comerc.subcategoria[k]}
                        </>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <h1 className="font-brand text-xl leading-tight text-km0-blue-900 flex-1 min-w-0">
                        {comerc.nom}
                      </h1>
                      {comerc.visitat && (
                        <span className="shrink-0 inline-flex items-center gap-1 font-ui text-[11px] font-bold text-km0-teal-600">
                          <Circle
                            size={8}
                            className="fill-km0-teal-500 text-km0-teal-500"
                          />
                          {t('merchant.status.active', lang)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-ui text-xs text-km0-blue-700/80 flex flex-wrap items-center gap-x-1.5">
                      <span
                        className={cn(
                          'font-bold',
                          comerc.obertAra
                            ? 'text-km0-teal-600'
                            : 'text-km0-coral-500'
                        )}
                      >
                        {stateOpen}
                      </span>
                      {comerc.tancaA && comerc.obertAra && (
                        <span>
                          ·{' '}
                          {interpolate(t('merchant.status.closes_at', lang), {
                            h: comerc.tancaA,
                          })}
                        </span>
                      )}
                      {typeof comerc.distanciaM === 'number' && (
                        <span>· {formatDistance(comerc.distanciaM)}</span>
                      )}
                    </p>

                    <div
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-ui text-[11px] font-bold"
                      aria-label={
                        comerc.visitat
                          ? t('merchant.status.scanned', lang)
                          : t('merchant.status.not_scanned', lang)
                      }
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
                          comerc.visitat
                            ? 'bg-km0-teal-500 text-white'
                            : 'bg-km0-beige-200 text-km0-blue-800/70'
                        )}
                      >
                        {comerc.visitat ? (
                          <CheckCircle2 size={12} strokeWidth={2.6} />
                        ) : (
                          <Circle size={12} strokeWidth={2.4} />
                        )}
                        {comerc.visitat
                          ? t('merchant.status.scanned', lang)
                          : t('merchant.status.not_scanned', lang)}
                      </span>
                    </div>
                  </header>

                  <div className="px-4">
                    <PointsCard c={comerc} lang={lang} onScan={openScanner} />
                  </div>

                  <section className="px-4">
                    <h2 className="font-brand text-sm text-km0-blue-900 mb-1">
                      {t('merchant.info.title', lang)}
                    </h2>
                    <div className="px-1 divide-y divide-km0-blue-100/60">
                      <InfoRow
                        icon={<MapPin size={16} />}
                        label={t('merchant.info.address', lang)}
                        value={
                          <>
                            {comerc.adreca}
                            <br />
                            <span className="text-km0-blue-700/70">
                              {[comerc.codiPostal, comerc.poblacio]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </>
                        }
                      />
                      {!comerc.openingHours && (
                        <InfoRow
                          icon={<Clock size={16} />}
                          label={t('merchant.info.schedule', lang)}
                          value={
                            <>
                              {comerc.horariAvui}
                              {comerc.obertAra && comerc.tancaA && (
                                <span className="ml-2 font-ui text-[11px] font-bold text-km0-teal-600">
                                  {t('merchant.status.open', lang)}
                                </span>
                              )}
                            </>
                          }
                        />
                      )}
                      {comerc.telefon && (
                        <InfoRow
                          icon={<Phone size={16} />}
                          label={t('merchant.info.phone', lang)}
                          value={comerc.telefon}
                          action={
                            <a
                              href={`tel:${comerc.telefon.replace(/\s+/g, '')}`}
                              className="px-2.5 py-1 rounded-lg bg-km0-blue-50 text-km0-blue-800 font-ui text-[11px] font-bold active:scale-95 transition-transform"
                            >
                              {t('merchant.info.call', lang)}
                            </a>
                          }
                        />
                      )}
                      {comerc.web && (
                        <InfoRow
                          icon={<Globe size={16} />}
                          label={t('merchant.info.web', lang)}
                          value={comerc.web}
                          action={
                            <a
                              href={
                                comerc.web.startsWith('http')
                                  ? comerc.web
                                  : `https://${comerc.web}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-km0-blue-50 text-km0-blue-800 font-ui text-[11px] font-bold active:scale-95 transition-transform"
                            >
                              {t('merchant.info.open_web', lang)}
                            </a>
                          }
                        />
                      )}
                    </div>
                  </section>

                  {comerc.openingHours && (
                    <section className="px-4">
                      <h2 className="font-brand text-sm text-km0-blue-900 mb-1 flex items-center gap-2">
                        <Clock size={14} className="text-km0-blue-800/70" />
                        {t('merchant.info.week', lang)}
                      </h2>
                      <OpeningHoursWeek
                        hours={comerc.openingHours}
                        lang={lang}
                      />
                    </section>
                  )}

                  {comerc.coordenades && (
                    <section className="px-4">
                      <h2 className="font-brand text-sm text-km0-blue-900 mb-1">
                        {t('merchant.map.title', lang)}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          if (comerc.coordenades) {
                            const { lat, lng } = comerc.coordenades
                            window.open(
                              `https://www.google.com/maps?q=${lat},${lng}`,
                              '_blank',
                              'noopener'
                            )
                          }
                        }}
                        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-km0-blue-100 bg-km0-teal-50 active:scale-[0.99] transition-transform"
                        aria-label={t('merchant.map.open', lang)}
                      >
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="relative flex items-center justify-center">
                            <span className="absolute w-10 h-10 rounded-full bg-km0-coral-500/25 animate-ping" />
                            <MapPin
                              size={28}
                              className="relative text-km0-coral-500"
                              fill="currentColor"
                            />
                          </span>
                        </span>
                      </button>
                    </section>
                  )}

                  {comerc.promocions.length > 0 && (
                    <section className="px-4">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="font-brand text-sm text-km0-blue-900 flex items-center gap-1.5">
                          <Tag size={14} />
                          {t('merchant.promos.title', lang)}
                        </h2>
                        <button
                          type="button"
                          onClick={() => navigate('/rewards?tab=promos')}
                          className="font-ui text-[11px] font-bold text-km0-coral-500"
                        >
                          {t('merchant.promos.see_all', lang)}
                        </button>
                      </div>
                      <div className="rounded-2xl border border-km0-blue-100 bg-white px-3">
                        <ul className="divide-y divide-km0-blue-100/60">
                          {comerc.promocions.slice(0, 3).map((p) => (
                            <PromoRow key={p.id} p={p} lang={lang} />
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}

                  {comerc.descripcio[k] && (
                    <section className="px-4">
                      <h2 className="font-brand text-sm text-km0-blue-900 mb-1">
                        {t('merchant.description.title', lang)}
                      </h2>
                      <p className="font-ui text-sm text-km0-blue-800/90 leading-relaxed">
                        {comerc.descripcio[k]}
                      </p>
                    </section>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {comerc && !loading && !isError && !comerc.visitat && (
            <div className="absolute left-0 right-0 bottom-0 z-20 px-4 pb-3 pt-4 bg-gradient-to-t from-km0-beige-50 via-km0-beige-50/95 to-transparent">
              <button
                type="button"
                onClick={openScanner}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-km0-blue-800 text-white font-ui text-sm font-bold shadow-lg shadow-km0-blue-800/30 active:scale-[0.99] transition-transform"
              >
                <ScanLine size={18} strokeWidth={2.4} />
                {interpolate(t('merchant.cta.scan_earn', lang), {
                  n: comerc.punts,
                })}
              </button>
            </div>
          )}
        </div>
      </div>
    </DeviceShell>
  )
}

export default ComercDetallPage
