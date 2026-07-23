import { useNotifications } from '@km0lab/app'
import {
  t,
  type Lang,
  todayResponseSchema,
  type TodayEventCard,
} from '@km0lab/app'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, Loader2, MapPin, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import ScreenTitle from '@/components/ScreenTitle'
import { useLang } from '@/contexts/LangContext'
import todayFixture from '@/data/fixtures/events-today.json'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * EventosHoy — Sección "Eventos de hoy".
 *
 * Datos: mientras `/api/v1/events/today` no permita CORS desde
 * *.lovable.app, se carga `@/data/fixtures/events-today.json` y se
 * valida con `todayResponseSchema` (contrato idéntico al de la API).
 *
 * Estados forzables por query param:
 *   · ?state=loading  → skeletons
 *   · ?state=empty    → sin eventos hoy
 *   · ?state=error    → error card + reintentar
 *   · (default)       → happy
 * ───────────────────────────────────────────────────────────── */

type ForcedState = 'loading' | 'empty' | 'error' | null

const IMG_BASE: string =
  (import.meta.env.VITE_EVENTS_API_URL as string | undefined) ??
  'https://eventquery.km0lab.com'

const parseForcedState = (v: string | null): ForcedState => {
  if (v === 'loading' || v === 'empty' || v === 'error') return v
  return null
}

const resolveImg = (url?: string | null): string | null => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${IMG_BASE}${url}`
}

const pickTitle = (ev: TodayEventCard, lang: Lang): string => {
  if (lang === 'ca') return ev.titulo_cat ?? ev.titulo_es ?? ''
  return ev.titulo_es ?? ev.titulo_cat ?? ''
}

const pickImage = (ev: TodayEventCard): string | null => {
  const principal = ev.imagenes.find((i) => i.es_principal) ?? ev.imagenes[0]
  return resolveImg(ev.imagen_url ?? principal?.url ?? null)
}

const formatHours = (ini?: string | null, fin?: string | null): string => {
  const clean = (s?: string | null) => (s ? s.slice(0, 5) /* HH:mm */ : null)
  const a = clean(ini)
  const b = clean(fin)
  if (a && b) return `${a} – ${b}`
  if (a) return a
  if (b) return b
  return ''
}

const formatPrice = (ev: TodayEventCard, lang: Lang): string => {
  const gratis = ev.es_gratuito || !ev.precio || ev.precio === 0
  if (gratis) return t('today.free', lang)
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(ev.precio ?? 0)
}

/* ─── Tarjeta ───────────────────────────────────────────────── */
const EventoHoyCard = ({
  evento,
  lang,
  onOpen,
}: {
  evento: TodayEventCard
  lang: Lang
  onOpen: () => void
}) => {
  const titulo = pickTitle(evento, lang)
  const img = pickImage(evento)
  const hours = formatHours(evento.hora_inicio, evento.hora_fin)
  const price = formatPrice(evento, lang)
  const isFree = evento.es_gratuito || !evento.precio || evento.precio === 0
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-km0-blue-100 rounded-2xl overflow-hidden shadow-sm hover:border-km0-blue-300 transition-colors"
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left active:scale-[0.99] transition-transform"
      >
        {img ? (
          <div className="aspect-[16/9] w-full bg-km0-blue-50 overflow-hidden">
            <img
              src={img}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-km0-blue-100 to-km0-blue-50 flex items-center justify-center">
            <CalendarDays size={28} className="text-km0-blue-700/40" />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-brand text-sm leading-tight text-km0-blue-900 mb-2 line-clamp-2">
            {titulo}
          </h3>
          <div className="flex flex-col gap-1">
            {evento.lugar && (
              <span className="inline-flex items-center gap-1 text-[11px] font-ui text-km0-blue-700/80">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{evento.lugar}</span>
              </span>
            )}
            {hours && (
              <span className="inline-flex items-center gap-1 text-[11px] font-ui text-km0-blue-700/80">
                <Clock size={11} className="shrink-0" />
                {hours}
              </span>
            )}
            <span
              className={cn(
                'self-start px-2 py-0.5 rounded-full text-[10px] font-ui font-bold mt-1',
                isFree
                  ? 'bg-km0-teal-100 text-km0-teal-700'
                  : 'bg-km0-yellow-100 text-km0-blue-900'
              )}
            >
              {price}
            </span>
          </div>
        </div>
      </button>
    </motion.article>
  )
}

const SkeletonCard = () => (
  <div className="bg-white border border-km0-blue-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[16/9] w-full bg-km0-blue-100/60" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 bg-km0-blue-100/70 rounded" />
      <div className="h-3 w-1/2 bg-km0-blue-100/50 rounded" />
      <div className="h-3 w-1/3 bg-km0-blue-100/50 rounded" />
    </div>
  </div>
)

/* ─── Página ────────────────────────────────────────────────── */
const EventosHoy = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const { hasUnread, markAllRead } = useNotifications()

  const forced = parseForcedState(searchParams.get('state'))

  const [eventos, setEventos] = useState<TodayEventCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)

    if (forced === 'loading') return
    if (forced === 'error') {
      setLoading(false)
      setError('FIXTURE_ERROR')
      return
    }
    if (forced === 'empty') {
      setLoading(false)
      setEventos([])
      return
    }

    const timer = window.setTimeout(() => {
      try {
        const parsed = todayResponseSchema.parse(todayFixture)
        setEventos(parsed.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'parse_error')
      } finally {
        setLoading(false)
      }
    }, 150)
    return () => window.clearTimeout(timer)
  }, [forced])

  useEffect(() => {
    const cleanup = load()
    return cleanup
  }, [load])

  const showSkeletons = loading || forced === 'loading'
  const showError = !showSkeletons && !!error
  const showEmpty = !showSkeletons && !error && eventos.length === 0

  const openEvento = (id: string) => {
    navigate(`/evento?id=${encodeURIComponent(id)}`)
  }

  return (
    <DeviceShell>
      <div className="flex-1 min-h-0 w-full flex flex-col landscape:flex-row px-4 horizontal-desktop:px-6 pt-5 landscape:pt-3 horizontal-desktop:pt-5 pb-0 overflow-y-auto landscape:overflow-hidden overflow-x-hidden">
        <div className="flex flex-col gap-3 w-full h-full min-h-0">
          <div className="-mx-4 -mt-2 shrink-0">
            <HomeHero
              cityName="Malgrat de Mar"
              hasAlerts={hasUnread}
              onToggleAlerts={markAllRead}
              onBack={() => navigate(-1)}
              backAriaLabel={t('common.back', lang)}
              showGreeting={false}
              greetingSlot={<ScreenTitle title={t('today.title', lang)} />}
            />
          </div>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-4',
              'grid grid-cols-1 vertical-tablet:grid-cols-2 horizontal-desktop:grid-cols-3 gap-3 auto-rows-max'
            )}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {showSkeletons && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {showError && (
              <div className="col-span-full bg-km0-coral-50 border border-km0-coral-200 rounded-2xl p-4 text-center">
                <p className="font-brand text-sm text-km0-coral-700 mb-2">
                  {t('today.error.title', lang)}
                </p>
                <p className="text-[11px] font-ui text-km0-coral-700/80 mb-3">
                  {t('today.error.subtitle', lang)}
                </p>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-km0-coral-500 text-white font-ui font-bold text-xs active:scale-95 transition-transform"
                >
                  <RefreshCw size={12} />
                  {t('today.error.retry', lang)}
                </button>
              </div>
            )}

            {showEmpty && (
              <div className="col-span-full bg-white border border-km0-blue-100 rounded-2xl p-5 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-km0-blue-700/50 mb-2"
                />
                <p className="font-brand text-sm text-km0-blue-900 mb-1">
                  {t('today.empty.title', lang)}
                </p>
                <p className="text-[11px] font-ui text-km0-blue-700/70">
                  {t('today.empty.subtitle', lang)}
                </p>
              </div>
            )}

            {!showSkeletons &&
              !error &&
              eventos.map((ev) => (
                <EventoHoyCard
                  key={ev.id}
                  evento={ev}
                  lang={lang}
                  onOpen={() => openEvento(ev.id)}
                />
              ))}

            {showSkeletons && (
              <div className="col-span-full flex items-center justify-center pt-2 text-[11px] font-ui text-km0-blue-700/60">
                <Loader2 size={12} className="animate-spin mr-1" />
                {t('common.loading', lang)}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </DeviceShell>
  )
}

export default EventosHoy
