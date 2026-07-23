import { useNotifications } from '@km0lab/app'
import {
  t,
  type Lang,
  type TKey,
  listEvents,
  type AgendaEvent as Evento,
} from '@km0lab/app'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Loader2,
  Music2,
  Palette,
  Baby,
  Trophy,
  Hammer,
  PartyPopper,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import ScreenTitle from '@/components/ScreenTitle'
import WhenTabs, { type WhenKey } from '@/components/WhenTabs'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────
 * Agenda — diseño "Bold" (mockup aprobado).
 *
 * Estructura visual:
 *   1. Título XL "Agenda" + número de día en mostaza.
 *   2. Segmented control de 4 opciones (Hoy / Mañana / Finde / Mes).
 *   3. Grid 4×2 de categorías, cada una con su color e icono.
 *   4. Toggle Gratis / Pago / Todos.
 *   5. Resultados agrupados por día.
 *
 * Sin búsqueda por texto. Sin filtros de "Lugares" ni "Tags".
 * ────────────────────────────────────────────────────────────── */

type Category =
  | 'todos'
  | 'musica'
  | 'cultura'
  | 'infantil'
  | 'deporte'
  | 'talleres'
  | 'fiestas'
  | 'gastronomia'
type Price = 'todos' | 'gratis' | 'pago'

interface CatDef {
  key: Category
  slug?: string
  labelKey: TKey
  matches: string[]
  Icon: typeof Music2
  activeBg: string
  activeText: string
  idleBg: string
  idleText: string
}

const CATEGORIES: CatDef[] = [
  {
    key: 'musica',
    slug: 'musica',
    labelKey: 'agenda.cat.musica',
    matches: ['música', 'musica', 'concierto'],
    Icon: Music2,
    activeBg: 'bg-km0-blue-900',
    activeText: 'text-white',
    idleBg: 'bg-km0-blue-900/90',
    idleText: 'text-white',
  },
  {
    key: 'cultura',
    slug: 'cultura',
    labelKey: 'agenda.cat.cultura',
    matches: ['cultura', 'exposición', 'teatro', 'cine'],
    Icon: Palette,
    activeBg: 'bg-km0-yellow-500',
    activeText: 'text-km0-blue-900',
    idleBg: 'bg-km0-yellow-400',
    idleText: 'text-km0-blue-900',
  },
  {
    key: 'infantil',
    slug: 'infantil',
    labelKey: 'agenda.cat.infantil',
    matches: ['infantil', 'niños', 'familia'],
    Icon: Baby,
    activeBg: 'bg-white',
    activeText: 'text-km0-blue-900',
    idleBg: 'bg-white',
    idleText: 'text-km0-blue-900',
  },
  {
    key: 'deporte',
    slug: 'deportes',
    labelKey: 'agenda.cat.deporte',
    matches: ['deporte', 'deport'],
    Icon: Trophy,
    activeBg: 'bg-km0-teal-500',
    activeText: 'text-white',
    idleBg: 'bg-km0-teal-400',
    idleText: 'text-white',
  },
  {
    key: 'talleres',
    slug: 'formacion',
    labelKey: 'agenda.cat.talleres',
    matches: ['taller', 'workshop', 'curso'],
    Icon: Hammer,
    activeBg: 'bg-km0-coral-500',
    activeText: 'text-white',
    idleBg: 'bg-km0-coral-400',
    idleText: 'text-white',
  },
  {
    key: 'fiestas',
    slug: 'fiestas-mayores',
    labelKey: 'agenda.cat.fiestas',
    matches: ['fiesta', 'festa', 'festival'],
    Icon: PartyPopper,
    activeBg: 'bg-km0-blue-700',
    activeText: 'text-white',
    idleBg: 'bg-km0-blue-600',
    idleText: 'text-white',
  },
  {
    key: 'gastronomia',
    slug: 'gastronomia',
    labelKey: 'agenda.cat.gastronomia',
    matches: ['gastro', 'comida', 'cocina', 'vino'],
    Icon: UtensilsCrossed,
    activeBg: 'bg-km0-coral-600',
    activeText: 'text-white',
    idleBg: 'bg-km0-coral-500',
    idleText: 'text-white',
  },
  {
    key: 'todos',
    labelKey: 'agenda.cat.todos',
    matches: [],
    Icon: Sparkles,
    activeBg: 'bg-km0-teal-600',
    activeText: 'text-white',
    idleBg: 'bg-km0-teal-500',
    idleText: 'text-white',
  },
]

/* ─── Helpers de fecha ──────────────────────────────────────── */
const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const endOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}
const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const rangeFor = (key: WhenKey): [Date, Date] => {
  const today = startOfDay(new Date())
  switch (key) {
    case 'semana': {
      // Hasta el próximo domingo inclusive
      const day = today.getDay() // 0=dom
      const daysToSunday = day === 0 ? 0 : 7 - day
      return [today, endOfDay(addDays(today, daysToSunday))]
    }
    case 'proxima-semana': {
      // Lunes a domingo de la semana siguiente
      const day = today.getDay() // 0=dom
      const daysToNextMonday = day === 0 ? 1 : 8 - day
      const start = startOfDay(addDays(today, daysToNextMonday))
      return [start, endOfDay(addDays(start, 6))]
    }
    case 'mes': {
      return [today, endOfDay(addDays(today, 30))]
    }
    case 'trimestre': {
      return [today, endOfDay(addDays(today, 90))]
    }
  }
}

const MONTHS_SHORT = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
]

const LOCALE_FOR: Record<Lang, string> = {
  ca: 'ca-ES',
  es: 'es-ES',
  en: 'en-GB',
}

const formatDayHeader = (d: Date, lang: Lang) => {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)
  const target = startOfDay(d)
  const base = d.toLocaleDateString(LOCALE_FOR[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const cap = base.charAt(0).toUpperCase() + base.slice(1)
  if (target.getTime() === today.getTime())
    return `${t('agenda.day.today', lang)}, ${base}`
  if (target.getTime() === tomorrow.getTime())
    return `${t('agenda.day.tomorrow', lang)}, ${base}`
  return cap
}

const formatTime = (t?: string) => (t ? t.slice(0, 5) : '')

/* ─── Tarjeta de evento ─────────────────────────────────────── */
const EventListCard = ({
  evento,
  onOpen,
}: {
  evento: Evento
  onOpen: (id: string) => void
}) => {
  const { lang } = useLang()
  const time = formatTime(evento.hora_inicio ?? undefined)
  const timeEnd = formatTime(evento.hora_fin ?? undefined)
  const cat = evento.categorias?.[0]
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onOpen(evento.id_unico_evento)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(evento.id_unico_evento)
        }
      }}
      className="bg-white border border-km0-blue-100 rounded-2xl p-3 shadow-sm hover:border-km0-blue-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-km0-blue-500"
    >
      <h4 className="font-brand text-sm leading-tight text-km0-blue-900 mb-1">
        {evento.titulo}
      </h4>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-ui text-km0-blue-700/80 mb-1.5">
        {time && (
          <span className="inline-flex items-center gap-1">
            <Clock size={11} />
            {time}
            {timeEnd && `–${timeEnd}`}
          </span>
        )}
        <span className="inline-flex items-center gap-1 truncate">
          <MapPin size={11} />
          <span className="truncate">
            {evento.lugar_nombre}
            {evento.poblacion_nombre && ` · ${evento.poblacion_nombre}`}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {evento.es_gratuito ? (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-teal-100 text-km0-teal-700">
            {t('agenda.badge.free', lang)}
          </span>
        ) : evento.precio_euros != null ? (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-yellow-100 text-km0-yellow-800">
            {evento.precio_euros.toFixed(2)} €
          </span>
        ) : null}
        {cat && (
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700">
            {cat}
          </span>
        )}
      </div>
    </motion.article>
  )
}

const SkeletonCard = () => (
  <div className="bg-white border border-km0-blue-100 rounded-2xl p-3 animate-pulse">
    <div className="h-4 w-2/3 bg-km0-blue-100/70 rounded mb-2" />
    <div className="h-3 w-1/2 bg-km0-blue-100/50 rounded mb-1.5" />
    <div className="h-3 w-1/3 bg-km0-blue-100/50 rounded" />
  </div>
)

/* ─── Página ─────────────────────────────────────────────────── */
const Agenda = () => {
  const navigate = useNavigate()
  const { hasUnread, markAllRead } = useNotifications()
  const { lang } = useLang()
  const [when, setWhen] = useState<WhenKey>('semana')
  const [category, setCategory] = useState<Category>('todos')
  const [price, setPrice] = useState<Price>('todos')

  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch — filtros estructurados al endpoint de lista /api/v1/events
  // (mismo que usa la web de eventquery): categoría (slug) + rango de
  // fechas del selector temporal + población.
  useEffect(() => {
    const cat = CATEGORIES.find((c) => c.key === category)
    const [from, to] = rangeFor(when)
    let cancelled = false
    setLoading(true)
    setError(null)
    listEvents({
      categoria: cat?.slug,
      poblacion: 'Malgrat de Mar',
      fechaDesde: toISODate(from),
      fechaHasta: toISODate(to),
      pageSize: 50,
      lang: lang === 'ca' ? 'ca' : 'es',
    })
      .then((res) => {
        if (!cancelled) setEventos(res.eventos ?? [])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category, when, lang])

  // Categoría, fechas y población ya las filtra el servidor; aquí solo el
  // precio (Gratis / Pago), que no se envía a la API.
  const filtered = useMemo(() => {
    return eventos.filter((e) => {
      if (price === 'gratis' && !e.es_gratuito) return false
      if (price === 'pago' && e.es_gratuito) return false
      return true
    })
  }, [eventos, price])

  const grouped = useMemo(() => {
    const map = new Map<string, { date: Date; items: Evento[] }>()
    filtered
      .slice()
      .sort(
        (a, b) =>
          +new Date(a.fecha_inicio ?? 0) - +new Date(b.fecha_inicio ?? 0)
      )
      .forEach((e) => {
        const d = startOfDay(new Date(e.fecha_inicio ?? 0))
        const k = d.toISOString()
        if (!map.has(k)) map.set(k, { date: d, items: [] })
        map.get(k)!.items.push(e)
      })
    return Array.from(map.values())
  }, [filtered])

  const today = new Date()
  const dayNum = today.getDate()
  const monthLabel = MONTHS_SHORT[today.getMonth()]

  /* ─── Render ─────────────────────────────────────── */
  const content = (
    <div className="flex flex-col gap-3 w-full h-full min-h-0">
      {/* ── Hero superior reutilizado del Home ─── */}
      <div className="-mx-4 -mt-5 shrink-0">
        <HomeHero
          cityName="Malgrat de Mar"
          hasAlerts={hasUnread}
          onToggleAlerts={markAllRead}
          onBack={() => navigate('/home')}
          backAriaLabel={t('agenda.back', lang)}
          showGreeting={false}
          greetingSlot={<ScreenTitle title={t('agenda.title', lang)} />}
        />
      </div>

      {/* ── Contenido no-hero: relative z-10 para pintarse SOBRE el
           HomeHero decorativo (que en landscape es absolute inset-0). ─── */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col gap-3">
        {/* ── Selector de rango temporal ─── */}
        <div className="shrink-0">
          <WhenTabs value={when} onChange={setWhen} />
        </div>

        {/* ── Categorías (grid 4×2, sin scroll horizontal) ─── */}
        <div className="grid grid-cols-4 gap-1 vertical-tablet:gap-1.5 my-0 shrink-0">
          {CATEGORIES.map((c) => {
            const active = category === c.key
            const Icon = c.Icon
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={cn(
                  'h-9 rounded-full inline-flex items-center justify-center gap-0.5 vertical-tablet:gap-1 px-0.5 vertical-tablet:px-1 font-ui text-[10px] vertical-tablet:text-[10.5px] font-bold transition-all active:scale-95 border',
                  active
                    ? `${c.activeBg} ${c.activeText} border-km0-blue-900 ring-2 ring-km0-blue-900/20 shadow-sm`
                    : `${c.idleBg} ${c.idleText} border-transparent opacity-90 hover:opacity-100`,
                  c.key === 'infantil' && 'border-km0-blue-200'
                )}
              >
                <Icon
                  size={10}
                  strokeWidth={2.5}
                  className="shrink-0 hidden vertical-tablet:block"
                />
                <span className="truncate">{t(c.labelKey, lang)}</span>
              </button>
            )
          })}
        </div>

        {/* ── Contador ─── */}
        <div className="text-[11px] font-ui text-km0-blue-700/80 px-0.5 shrink-0">
          {loading ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 size={11} className="animate-spin" />
              {t('agenda.searching', lang)}
            </span>
          ) : (
            <>
              <span className="font-bold text-km0-blue-900">
                {filtered.length}
              </span>{' '}
              {filtered.length === 1
                ? t('agenda.count.one', lang)
                : t('agenda.count.many', lang)}
            </>
          )}
        </div>

        {/* ── Resultados (única zona scrollable, touch nativo móvil) ─── */}
        <section
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain space-y-3 -mx-4 px-4 pb-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {loading && eventos.length === 0 && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!loading && error && (
            <div className="bg-km0-coral-50 border border-km0-coral-200 rounded-2xl p-4 text-xs font-ui text-km0-coral-700">
              {t('agenda.error', lang)} {error}
            </div>
          )}

          {!loading && !error && grouped.length === 0 && (
            <div className="bg-white border border-km0-blue-100 rounded-2xl p-5 text-center">
              <CalendarIcon
                size={28}
                className="mx-auto text-km0-blue-700/50 mb-2"
              />
              <p className="font-brand text-sm text-km0-blue-900 mb-1">
                {t('agenda.empty.title', lang)}
              </p>
              <p className="text-[11px] font-ui text-km0-blue-700/70">
                {t('agenda.empty.hint', lang)}
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {grouped.map((g) => (
              <motion.div
                key={g.date.toISOString()}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <h3 className="font-brand text-xs text-km0-blue-900/80 sticky top-0 bg-km0-beige-50/95 backdrop-blur-sm py-1 -mx-1 px-1 z-10">
                  {formatDayHeader(g.date, lang)}
                </h3>
                {g.items.map((e) => (
                  <EventListCard
                    key={e.id_unico_evento}
                    evento={e}
                    onOpen={(id) =>
                      navigate(`/evento?id=${encodeURIComponent(id)}`)
                    }
                  />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )

  return (
    <DeviceShell>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50">
          <div className="flex-1 min-h-0 w-full flex flex-col px-4 pt-5 pb-0 overflow-y-auto overflow-x-hidden">
            {content}
          </div>
        </div>
      </div>
    </DeviceShell>
  )
}

export default Agenda
