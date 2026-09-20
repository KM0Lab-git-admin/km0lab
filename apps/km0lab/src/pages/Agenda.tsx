import { useNotifications, useAppStore } from '@km0lab/app'
import {
  t,
  type Lang,
  getCategories,
  listEvents,
  type AgendaEvent as Evento,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { useQuery } from '@tanstack/react-query'
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
  PartyPopper,
  UtensilsCrossed,
  Sparkles,
  MessageCircle,
  Clapperboard,
  GraduationCap,
  BookOpen,
  Trees,
  Gamepad2,
  Theater,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import ScreenTitle from '@/components/ScreenTitle'
import WhenTabs, { type WhenKey } from '@/components/WhenTabs'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/** Municipio por defecto si el usuario no tiene población guardada. */
const DEFAULT_TOWN = 'Malgrat de Mar'

/* ──────────────────────────────────────────────────────────────
 * Agenda — diseño "Bold" (mockup aprobado).
 *
 * Estructura visual:
 *   1. Título XL "Agenda" + número de día en mostaza.
 *   2. Fila de categorías con iconos y tratamiento cromático uniforme.
 *   3. Resultados agrupados por día.
 *
 * Filtro de rango temporal (WhenTabs): "Esta semana" o "Próximos 30 días";
 * se envía como fecha_desde/fecha_hasta al endpoint de lista.

 *
 * Sin búsqueda por texto. Sin filtros de "Lugares" ni "Tags".
 * ────────────────────────────────────────────────────────────── */

/** Selección de categorías: slugs de la API. Lista vacía = «Tots» (sin filtro). */
type Price = 'todos' | 'gratis' | 'pago'

interface CategoryPresentation {
  Icon: typeof Music2
}

/** Icono por slug de la API. Slugs nuevos usan `DEFAULT_CATEGORY_PRESENTATION`. */
const CATEGORY_PRESENTATIONS: Record<string, CategoryPresentation> = {
  xerrades: { Icon: MessageCircle },
  charlas: { Icon: MessageCircle },
  cinema: { Icon: Clapperboard },
  cine: { Icon: Clapperboard },
  cultura: { Icon: Palette },
  esports: { Icon: Trophy },
  deportes: { Icon: Trophy },
  'festes-majors': { Icon: PartyPopper },
  'fiestas-mayores': { Icon: PartyPopper },
  formacio: { Icon: GraduationCap },
  formacion: { Icon: GraduationCap },
  infantil: { Icon: Baby },
  lectura: { Icon: BookOpen },
  musica: { Icon: Music2 },
  naturalesa: { Icon: Trees },
  naturaleza: { Icon: Trees },
  oci: { Icon: Gamepad2 },
  ocio: { Icon: Gamepad2 },
  teatre: { Icon: Theater },
  teatro: { Icon: Theater },
  gastronomia: { Icon: UtensilsCrossed },
}

const DEFAULT_CATEGORY_PRESENTATION: CategoryPresentation = { Icon: Sparkles }
const ALL_CATEGORY_PRESENTATION: CategoryPresentation = { Icon: LayoutGrid }

/* ─── Helpers de fecha ──────────────────────────────────────── */
const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
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

/** Rango de fechas para el filtro WhenTabs. "todos" = sin fecha límite. */
const rangeFor = (when: WhenKey): { desde: string; hasta?: string } => {
  const today = startOfDay(new Date())
  if (when === 'todos') return { desde: toISODate(today) }
  const days = when === 'semana' ? 7 : 30
  return { desde: toISODate(today), hasta: toISODate(addDays(today, days)) }
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
  const dateLabel = evento.fecha_inicio
    ? new Date(evento.fecha_inicio).toLocaleDateString(LOCALE_FOR[lang], {
        day: 'numeric',
        month: 'short',
      })
    : null
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
      className="bg-white border border-km0-blue-100 rounded-2xl overflow-hidden shadow-sm hover:border-km0-blue-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-km0-blue-500"
    >
      {evento.url_imagen && (
        <div className="relative w-full aspect-[16/9] bg-km0-blue-50">
          <img
            src={evento.url_imagen}
            alt={evento.titulo}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {evento.es_gratuito ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-teal-500 text-white shadow-sm">
              {t('agenda.badge.free', lang)}
            </span>
          ) : evento.precio_euros != null ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-yellow-400 text-km0-blue-900 shadow-sm">
              {evento.precio_euros.toFixed(2)} €
            </span>
          ) : null}
        </div>
      )}
      <div className="p-3">
        <h4 className="font-brand text-sm leading-tight text-km0-blue-900 mb-1">
          {evento.titulo}
        </h4>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-ui text-km0-blue-700/80 mb-1.5">
          {dateLabel && (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon size={11} />
              {dateLabel}
            </span>
          )}
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
          {!evento.url_imagen && evento.es_gratuito && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-teal-100 text-km0-teal-700">
              {t('agenda.badge.free', lang)}
            </span>
          )}
          {!evento.url_imagen &&
            !evento.es_gratuito &&
            evento.precio_euros != null && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-yellow-100 text-km0-yellow-800">
                {evento.precio_euros.toFixed(2)} €
              </span>
            )}
          {cat && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700">
              {cat}
            </span>
          )}
        </div>
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
  /** Selección múltiple y acumulativa; [] equivale a «Tots». */
  const [selected, setSelected] = useState<string[]>([])
  /** La cuadrícula de categorías empieza visible; se puede plegar. */
  const [catsOpen, setCatsOpen] = useState(true)
  const [price, setPrice] = useState<Price>('todos')
  const [when, setWhen] = useState<WhenKey>('mes')

  // Población elegida por el usuario (CP → población), con fallback.
  const town = useAppStore((s) => s.town) ?? DEFAULT_TOWN

  // Categorías reales de la API: solo las que tienen eventos activos en
  // esta población (el endpoint ya filtra por Estado='ACTIVO').
  const { data: apiCategories = [] } = useQuery({
    queryKey: ['categories', town],
    queryFn: () => getCategories(town),
    staleTime: 5 * 60 * 1000,
  })

  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch — filtros estructurados al endpoint de lista /api/v1/events
  // (mismo que usa la web de eventquery): población + rango de fechas
  // según el selector WhenTabs. Las categorías son selección múltiple y
  // se aplican en cliente (unión de slugs sobre `tags`).
  useEffect(() => {
    const { desde, hasta } = rangeFor(when)
    let cancelled = false
    setLoading(true)
    setError(null)
    listEvents({
      poblacion: town,
      fechaDesde: desde,
      fechaHasta: hasta,
      pageSize: 100,
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
  }, [when, lang, town])

  // Población ya la filtra el servidor; aquí solo el precio
  // (Gratis / Pago), que no se envía a la API.

  /** Alterna una categoría en la selección múltiple. */
  const toggleCategory = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )

  // El endpoint de categorías cuenta TODOS los eventos activos, incluidos
  // los ya celebrados. Para no mostrar categorías vacías consultamos los
  // eventos del rango vigente (sin filtro de categoría) y nos quedamos con
  // los slugs realmente presentes.
  const { desde: rangeDesde, hasta: rangeHasta } = rangeFor(when)
  const { data: availableSlugs } = useQuery({
    queryKey: ['category-availability', town, rangeDesde, rangeHasta ?? 'open'],
    queryFn: async () => {
      const res = await listEvents({
        poblacion: town,
        fechaDesde: rangeDesde,
        fechaHasta: rangeHasta,
        pageSize: 100,
        lang: lang === 'ca' ? 'ca' : 'es',
      })
      return new Set(res.eventos.flatMap((e) => e.tags))
    },
    staleTime: 5 * 60 * 1000,
  })

  // Categorías devueltas por la API + "Tots" al final.
  const chips = useMemo(() => {
    const items = apiCategories
      .filter((c) => !availableSlugs || availableSlugs.has(c.slug))
      .map((c) => ({
        key: c.slug,
        label: lang === 'ca' ? c.nombre_cat : c.nombre_es,
        presentation:
          CATEGORY_PRESENTATIONS[c.slug] ?? DEFAULT_CATEGORY_PRESENTATION,
      }))
    return [
      ...items,
      {
        key: 'todos',
        label: t('agenda.cat.todos', lang),
        presentation: ALL_CATEGORY_PRESENTATION,
      },
    ]
  }, [apiCategories, availableSlugs, lang])

  // Si una categoría seleccionada deja de tener eventos en el rango
  // vigente, se retira de la selección (el resto se conserva).
  useEffect(() => {
    if (!availableSlugs) return
    setSelected((prev) => {
      const next = prev.filter((s) => availableSlugs.has(s))
      return next.length === prev.length ? prev : next
    })
  }, [availableSlugs])

  /**
   * Chips de cabecera plegable: muestran todas las categorías
   * seleccionadas una al lado de la otra; con selección vacía, «Tots».
   */
  const selectedChips = chips.filter((c) => selected.includes(c.key))
  const allChip = chips[chips.length - 1] ?? null
  const headerChips =
    selectedChips.length > 0 ? selectedChips : allChip ? [allChip] : []

  const filtered = useMemo(() => {
    return eventos.filter((e) => {
      if (selected.length > 0 && !e.tags.some((s) => selected.includes(s)))
        return false
      if (price === 'gratis' && !e.es_gratuito) return false
      if (price === 'pago' && e.es_gratuito) return false
      return true
    })
  }, [eventos, selected, price])

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
        {/* ── Rango temporal ─── */}
        <WhenTabs value={when} onChange={setWhen} className="shrink-0" />

        {/* ── Categorías: cabecera con la selección activa + cuadrícula plegable ─── */}
        <div className="shrink-0">
          <div className="flex items-end justify-between gap-2 px-0.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-ui text-[9px] font-bold uppercase tracking-[0.14em] text-km0-blue-500">
                {t('agenda.cats.label', lang)}
              </span>
              {headerChips.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setCatsOpen((v) => !v)}
                  aria-expanded={catsOpen}
                  aria-label={`${t('agenda.cats.label', lang)}: ${headerChips
                    .map((c) => c.label)
                    .join(', ')}`}
                  className="flex min-w-0 flex-wrap items-center gap-1 self-start"
                >
                  {headerChips.map((c) => {
                    const Icon = c.presentation.Icon
                    return (
                      <span
                        key={c.key}
                        className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg border-2 border-km0-yellow-400 bg-km0-yellow-400 px-2.5 shadow-sm transition-all hover:bg-km0-yellow-500"
                      >
                        <Icon
                          size={14}
                          strokeWidth={2.5}
                          className="shrink-0 text-km0-blue-900"
                        />
                        <span className="min-w-0 truncate font-ui text-[11px] font-bold text-km0-blue-900">
                          {c.label}
                        </span>
                      </span>
                    )
                  })}
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              className="inline-flex shrink-0 items-center gap-1 pb-1.5"
            >
              <span className="font-ui text-[10px] font-bold uppercase underline underline-offset-4 text-km0-blue-700">
                {t(catsOpen ? 'agenda.cats.hide' : 'agenda.cats.show', lang)}
              </span>
              {catsOpen ? (
                <ChevronUp size={13} className="shrink-0 text-km0-blue-700" />
              ) : (
                <ChevronDown size={13} className="shrink-0 text-km0-blue-700" />
              )}
            </button>
          </div>

          <div
            className={cn(
              'grid transition-all duration-300 ease-out',
              catsOpen
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {chips.map((c) => {
                  const active =
                    c.key === 'todos'
                      ? selected.length === 0
                      : selected.includes(c.key)
                  const Icon = c.presentation.Icon
                  return (
                    <Button
                      key={c.key}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        c.key === 'todos'
                          ? setSelected([])
                          : toggleCategory(c.key)
                      }
                      aria-pressed={active}
                      className={cn(
                        'h-11 min-w-0 rounded-lg border-2 px-1 font-ui text-[9px] leading-tight transition-all active:scale-95',
                        active
                          ? 'border-km0-yellow-400 bg-km0-yellow-400 text-km0-blue-900 shadow-sm hover:bg-km0-yellow-500 hover:text-km0-blue-900'
                          : 'border-km0-blue-100 bg-white text-km0-blue-700 hover:border-km0-yellow-400 hover:bg-km0-yellow-50 hover:text-km0-blue-900'
                      )}
                    >
                      <Icon
                        size={14}
                        strokeWidth={2.5}
                        className={cn(
                          'shrink-0',
                          active ? 'text-km0-blue-900' : 'text-km0-blue-500'
                        )}
                      />
                      <span className="min-w-0 truncate">{c.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
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
                      navigate(`/event?id=${encodeURIComponent(id)}`)
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
