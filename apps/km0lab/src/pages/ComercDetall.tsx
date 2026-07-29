import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import { useLang } from '@/contexts/LangContext'
import { useNotifications } from '@km0lab/app'
import { t, type Lang } from '@km0lab/app'
import { cn } from '@/lib/utils'
import { COMERCIOS_DETALL } from '@/data/comerciosAdheridos'
import type { ComercDetall, PromocioInfo } from '@km0lab/app'

/* ─────────────────────────────────────────────────────────────
 * ComercDetall — Fitxa del comerç adherit (mock).
 *
 * Dos estats (mateixa pantalla, canvia la tarjeta d'acció i el CTA):
 *   - visitat = false → convida a escanejar el QR.
 *   - visitat = true  → confirma els punts guanyats.
 *
 * Toggle mock: `?visitat=true|false` sobreescriu el mock del comerç.
 * ───────────────────────────────────────────────────────────── */

const interpolate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

const langKey = (lang: Lang): 'ca' | 'es' => (lang === 'en' ? 'es' : lang)

const formatDistance = (m: number): string =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`

/* ─── Header imatge ─────────────────────────────────────────── */
const HeroImage = ({ c, lang }: { c: ComercDetall; lang: Lang }) => (
  <div className="relative w-full aspect-[16/10] overflow-hidden bg-km0-beige-100">
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        c.bg ?? 'bg-km0-beige-100'
      )}
    >
      {c.imatge ? (
        <img
          src={c.imatge}
          alt={c.nom}
          className="w-full h-full object-contain p-8"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
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
  const [notifOpen, setNotifOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const forced = params.get('state')

  useEffect(() => {
    if (forced === 'loading') {
      setLoading(true)
      return
    }
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [forced, id])

  const visitatOverride = params.get('visitat')
  const initialVisitat =
    visitatOverride === 'true' || visitatOverride === '1'
      ? true
      : visitatOverride === 'false' || visitatOverride === '0'
        ? false
        : null
  const [visitatToggle, setVisitatToggle] = useState<boolean | null>(
    initialVisitat
  )

  const comerc = useMemo<ComercDetall | undefined>(() => {
    if (!id) return undefined
    const base = COMERCIOS_DETALL[id]
    if (!base) return undefined
    if (visitatToggle !== null) {
      return { ...base, visitat: visitatToggle }
    }
    return base
  }, [id, visitatToggle])

  const k = langKey(lang)
  const isError = forced === 'error'
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
            cityName="Malgrat de Mar"
            hasAlerts={hasUnread}
            onToggleAlerts={() => {
              setNotifOpen((v) => !v)
              markAllSeen()
            }}
            onBack={goBack}
            backAriaLabel={t('merchant.back', lang)}
            showGreeting={false}
          />

          {/* Body scroll */}
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
                    onClick={() => setLoading(true)}
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

                  {/* Títol + estat */}
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
                            strokeWidth={0}
                            fill="currentColor"
                            className="text-km0-teal-500"
                          />
                          {t('merchant.status.active', lang)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-ui text-xs text-km0-blue-700/80 flex flex-wrap items-center gap-x-2 gap-y-0.5">
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
                      <span>· {formatDistance(comerc.distanciaM)}</span>
                    </p>
                  </header>

                  {/* Toggle previsualització d'estat (només mock) */}
                  <div className="px-4">
                    <div
                      role="group"
                      aria-label="Estat de visita (previsualització)"
                      className="inline-flex items-center gap-1 p-1 rounded-full bg-km0-blue-50 border border-km0-blue-100"
                    >
                      <button
                        type="button"
                        onClick={() => setVisitatToggle(false)}
                        className={cn(
                          'px-3 py-1 rounded-full font-ui text-[11px] font-bold transition-colors',
                          !comerc.visitat
                            ? 'bg-km0-blue-800 text-white'
                            : 'text-km0-blue-800/70'
                        )}
                      >
                        Encara no visitat
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisitatToggle(true)}
                        className={cn(
                          'px-3 py-1 rounded-full font-ui text-[11px] font-bold transition-colors',
                          comerc.visitat
                            ? 'bg-km0-teal-500 text-white'
                            : 'text-km0-blue-800/70'
                        )}
                      >
                        Ja escanejat
                      </button>
                    </div>
                  </div>

                  {/* Tarjeta punts */}
                  <div className="px-4">
                    <PointsCard c={comerc} lang={lang} onScan={openScanner} />
                  </div>

                  {/* Info */}
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
                              {comerc.codiPostal} · {comerc.poblacio}
                            </span>
                          </>
                        }
                      />
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
                              href={`https://${comerc.web}`}
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

                  {/* Mapa placeholder */}
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
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-70"
                        style={{
                          backgroundImage:
                            'linear-gradient(hsl(var(--km0-blue-100)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--km0-blue-100)) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="relative flex items-center justify-center">
                          <span className="absolute w-10 h-10 rounded-full bg-km0-coral-500/25 animate-ping" />
                          <span className="relative w-9 h-9 rounded-full bg-km0-coral-500 text-white flex items-center justify-center shadow-lg">
                            <MapPin size={18} strokeWidth={2.4} />
                          </span>
                        </span>
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-white/90 font-ui text-[11px] font-bold text-km0-blue-800 shadow-sm">
                        {t('merchant.map.open', lang)}
                      </span>
                    </button>
                  </section>

                  {/* Promocions */}
                  <section className="px-4">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-brand text-sm text-km0-blue-900">
                        {t('merchant.promos.title', lang)}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-ui font-bold uppercase tracking-wide text-km0-blue-700/60">
                        <Tag size={10} />
                        {t('merchant.promos.info_only', lang)}
                      </span>
                    </div>
                    <div className="bg-white border border-km0-blue-100 rounded-2xl px-3 divide-y divide-km0-blue-100/60">
                      <ul>
                        {comerc.promocions.slice(0, 3).map((p) => (
                          <PromoRow key={p.id} p={p} lang={lang} />
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Descripció */}
                  <section className="px-4">
                    <h2 className="font-brand text-sm text-km0-blue-900 mb-1">
                      {t('merchant.description.title', lang)}
                    </h2>
                    <p className="font-ui text-sm text-km0-blue-800/90 leading-relaxed">
                      {comerc.descripcio[k]}
                    </p>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* CTA sticky — només escanejar */}
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
