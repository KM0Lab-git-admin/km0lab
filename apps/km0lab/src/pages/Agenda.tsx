import {
  useNotificationsPanel,
  useDragScroll,
  useScopeEvents,
  useScopeCategories,
  useTerritory,
  usePreviewState,
  filterScopeTown,
  countEventCategories,
  t,
  tf,
  formatScreenDate,
  type Lang,
  type AgendaEvent as Evento,
  Town,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
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
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CategoryFilterMenu, {
  type CategoryFilterOption,
} from '@/components/CategoryFilterMenu'
import NotificationBell from '@/components/NotificationBell'
import NotificationsOverlay from '@/components/NotificationsOverlay'
import ScreenHeader from '@/components/ScreenHeader'
import ScreenStatus from '@/components/ScreenStatus'
import { TownTag } from '@/components/TownTag'
import WhenTabs, { type WhenKey } from '@/components/WhenTabs'
import { useLang } from '@/contexts/LangContext'

/* ──────────────────────────────────────────────────────────────
 * Agenda — diseño "Bold" (mockup aprobado).
 *
 * Estructura visual:
 *   1. Título XL "Agenda" + número de día en mostaza.
 *   2. Fila de rango temporal + menú desplegable de categorías (CategoryFilterMenu).
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
  town,
  isHome = false,
}: {
  evento: Evento
  town?: Town
  isHome?: boolean
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
      className="bg-card border border-km0-blue-100 rounded-2xl overflow-hidden shadow-sm hover:border-km0-blue-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-km0-blue-500"
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
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-teal-500 text-primary-foreground shadow-sm">
              {t('agenda.badge.free', lang)}
            </span>
          ) : evento.precio_euros != null ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold bg-km0-yellow-500 text-km0-blue-900 shadow-sm">
              {evento.precio_euros.toFixed(2)} €
            </span>
          ) : null}
        </div>
      )}
      <div className="p-3">
        {town && (
          <div className="mb-1 flex">
            <TownTag townName={town.name} isHome={isHome} lang={lang} />
          </div>
        )}
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

/* ─── Página ─────────────────────────────────────────────────── */
const Agenda = () => {
  const navigate = useNavigate()
  const notifications = useNotificationsPanel()
  const scrollRef = useDragScroll('vertical')
  const { lang } = useLang()
  /** Selección múltiple y acumulativa; [] equivale a «Tots». */
  const [selected, setSelected] = useState<string[]>([])
  const [price] = useState<Price>('todos')
  const [when, setWhen] = useState<WhenKey>('mes')

  const { territory, homeTown, isGrouped } = useTerritory()
  const [selectedTown, setSelectedTown] = useState<string | null>(null)
  useEffect(() => {
    setSelectedTown(null)
  }, [territory?.scopeId, territory?.homeTownId])
  const { categories: apiCategories } = useScopeCategories()
  const { desde: rangeDesde, hasta: rangeHasta } = rangeFor(when)
  const scope = useScopeEvents({
    fechaDesde: rangeDesde,
    fechaHasta: rangeHasta,
    lang: lang === 'ca' ? 'ca' : 'es',
  })
  const entries = useMemo(
    () => filterScopeTown([...scope.home, ...scope.nearby], selectedTown),
    [scope.home, scope.nearby, selectedTown]
  )
  const eventos = useMemo(() => entries.map((entry) => entry.item), [entries])
  const loading = scope.loading
  const error = scope.error
  const availableSlugs = useMemo(
    () => new Set(eventos.flatMap((event) => event.tags)),
    [eventos]
  )
  const townsByEvent = new Map(
    entries.map((entry) => [entry.item.id_unico_evento, entry.town])
  )
  const failures =
    territory?.towns.filter(
      (origin) =>
        scope.failedTownIds.includes(origin.id) &&
        (selectedTown === null || selectedTown === origin.id)
    ) ?? []

  /** Alterna una categoría en la selección múltiple. */
  const toggleCategory = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )

  // Conteos por categoría sobre los eventos del rango vigente (el mismo
  // listado que ve el usuario), así el número del menú coincide con lo que
  // aparece al elegir esa categoría. Un evento cuenta una sola vez por
  // categoría aunque repita el tag.
  const categoryCounts = useMemo(() => countEventCategories(entries), [entries])

  // Categorías devueltas por la API + "Tots" al final.
  const chips = useMemo(() => {
    const knownSlugs = new Set(apiCategories.map((category) => category.slug))
    const categories = [
      ...apiCategories,
      ...[...availableSlugs]
        .filter((slug) => !knownSlugs.has(slug))
        .map((slug) => ({ slug, nombre_cat: slug, nombre_es: slug })),
    ]
    const items = categories
      .filter((c) => !availableSlugs || availableSlugs.has(c.slug))
      .map((c) => ({
        key: c.slug,
        label: lang === 'ca' ? c.nombre_cat : c.nombre_es,
        presentation:
          CATEGORY_PRESENTATIONS[c.slug] ?? DEFAULT_CATEGORY_PRESENTATION,
        count: categoryCounts.get(c.slug) ?? 0,
      }))
    return [
      ...items,
      {
        key: 'todos',
        label: t('agenda.cat.todos', lang),
        presentation: ALL_CATEGORY_PRESENTATION,
        count: eventos.length,
      },
    ]
  }, [apiCategories, availableSlugs, categoryCounts, eventos.length, lang])

  // Si una categoría seleccionada deja de tener eventos en el rango
  // vigente, se retira de la selección (el resto se conserva).
  useEffect(() => {
    if (loading || error) return
    setSelected((prev) => {
      const next = prev.filter((s) => availableSlugs.has(s))
      return next.length === prev.length ? prev : next
    })
  }, [availableSlugs, loading, error])

  /**
   * Chips de cabecera plegable: muestran todas las categorías
   * seleccionadas una al lado de la otra; con selección vacía, «Tots».
   */
  const allChip = chips[chips.length - 1]
  const selectedLabels = chips
    .filter((c) => selected.includes(c.key))
    .map((c) => c.label)
  const toOption = (c: (typeof chips)[number]): CategoryFilterOption => {
    const Icon = c.presentation.Icon
    return {
      key: c.key,
      label: c.label,
      icon: <Icon size={16} strokeWidth={2.4} />,
      count: c.count,
    }
  }

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
        map.get(k)?.items.push(e)
      })
    return Array.from(map.values())
  }, [filtered])

  const { state, retry, isSample } = usePreviewState(
    loading,
    error !== null,
    grouped.length === 0
  )

  /* ─── Render ─────────────────────────────────────── */
  const content = (
    <>
      <ScreenHeader
        title={t('agenda.title', lang)}
        subtitle={formatScreenDate(new Date(), lang)}
        onBack={() => navigate('/home')}
        backAriaLabel={t('agenda.back', lang)}
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

      <div className="relative z-10 flex-1 min-h-0 flex flex-col gap-3 px-4 pt-3">
        {/* ── Rango temporal + menú de categorías en la misma fila ─── */}
        <div className="flex shrink-0 items-center gap-2">
          <WhenTabs
            compact={isGrouped}
            value={when}
            onChange={setWhen}
            className="min-w-0 flex-1"
          />
          <CategoryFilterMenu
            title={t('agenda.cats.label', lang)}
            multiple
            allOption={toOption(allChip)}
            options={chips.slice(0, -1).map(toOption)}
            selected={selected}
            onToggle={toggleCategory}
            onClear={() => setSelected([])}
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

        {/* ── Contador ─── */}
        <div className="text-[11px] font-ui text-km0-blue-700/80 px-0.5 shrink-0">
          {state === 'loading' ? (
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
              {selectedLabels.length > 0 && (
                <span className="text-km0-blue-700/70">
                  {' '}
                  · {selectedLabels.join(', ')}
                </span>
              )}
            </>
          )}
        </div>

        {/* ── Resultados (única zona scrollable, touch nativo móvil) ─── */}
        <section
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain space-y-3 -mx-4 px-4 pb-4"
          ref={scrollRef}
        >
          {isSample && (
            <p
              role="status"
              className="font-ui text-xs font-bold text-km0-coral-700"
            >
              {t('territory.sampleContent', lang)}
            </p>
          )}
          <ScreenStatus
            state={state}
            emptyKey="agenda.empty.title"
            onRetry={() => retry(scope.reload)}
          />
          {state !== 'loading' &&
            state !== 'error' &&
            failures.map((origin) => (
              <p
                key={origin.id}
                role="status"
                className="font-body text-xs text-muted-foreground"
              >
                {tf('territory.townUnavailable', lang, { town: origin.name })}
              </p>
            ))}

          <AnimatePresence initial={false}>
            {(state === 'ready' ? grouped : []).map((g) => (
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
                    town={
                      isGrouped
                        ? townsByEvent.get(e.id_unico_evento)
                        : undefined
                    }
                    isHome={
                      townsByEvent.get(e.id_unico_evento)?.id === homeTown?.id
                    }
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
    </>
  )

  return (
    <>
      <div className="w-full h-full bg-km0-beige-50 overflow-hidden flex justify-center">
        <div
          ref={notifications.setContainer}
          className="relative w-full max-w-[430px] h-full flex flex-col overflow-hidden bg-km0-beige-50"
        >
          {content}
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
        </div>
      </div>
    </>
  )
}

export default Agenda
