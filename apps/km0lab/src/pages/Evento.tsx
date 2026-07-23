import { t } from '@km0lab/app'
import { getEvento, type EventoDetalleAdaptado } from '@km0lab/app'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Share2,
  ExternalLink,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * Evento — Ficha completa de un evento (portrait único).
 *
 * Carga datos vía getEvento(id) del endpoint /api/v1/eventos.
 * Muestra: hero-carrusel, título, categoría/badges, cuándo (horarios[]),
 * dónde, descripción completa, organizador, tags, fuente original.
 * ───────────────────────────────────────────────────────────── */

const formatFechaLarga = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  return d
    .toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, (c) => c.toUpperCase())
}

const formatHora = (t?: string | null) => (t ? t.slice(0, 5) : '')

const formatRango = (
  fInicio?: string | null,
  fFin?: string | null,
  hInicio?: string | null,
  hFin?: string | null
) => {
  const fecha =
    fInicio && fFin && fInicio !== fFin
      ? `${formatFechaLarga(fInicio)} → ${formatFechaLarga(fFin)}`
      : formatFechaLarga(fInicio ?? fFin ?? null)
  const hi = formatHora(hInicio)
  const hf = formatHora(hFin)
  const hora = hi ? (hf ? `${hi} – ${hf}` : hi) : ''
  return { fecha, hora }
}

/* ── Carrusel de imágenes ────────────────────────────────────── */
const ImageCarousel = ({
  imagenes,
  alt,
  className,
  overlay,
}: {
  imagenes: string[]
  alt: string
  className?: string
  overlay?: React.ReactNode
}) => {
  const [idx, setIdx] = useState(0)
  const total = imagenes.length
  if (total === 0) {
    return (
      <div
        className={cn(
          'relative bg-km0-blue-100 flex items-center justify-center',
          className
        )}
      >
        <Calendar size={40} className="text-km0-blue-300" />
        {overlay}
      </div>
    )
  }
  const go = (n: number) => setIdx((n + total) % total)

  return (
    <div className={cn('relative overflow-hidden bg-km0-blue-900', className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={idx}
          src={imagenes[idx]}
          alt={`${alt} (${idx + 1}/${total})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {overlay}

      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              go(idx - 1)
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow active:scale-95 z-10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={16} className="text-km0-blue-900" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              go(idx + 1)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow active:scale-95 z-10"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={16} className="text-km0-blue-900" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {imagenes.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setIdx(i)
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                )}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Detalle ─────────────────────────────────────────────────── */
const EventoDetalle = ({
  ev,
  onBack,
}: {
  ev: EventoDetalleAdaptado
  onBack: () => void
}) => {
  const { lang } = useLang()

  const horarios = useMemo(() => {
    if (ev.horarios.length > 0) return ev.horarios
    return [
      {
        fechaInicio: ev.fechaInicio,
        fechaFin: ev.fechaFin,
        horaInicio: ev.horaInicio,
        horaFin: ev.horaFin,
      },
    ]
  }, [ev])

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ev.titulo,
          text: ev.descripcionCorta || ev.titulo,
          url: window.location.href,
        })
      } catch {
        /* cancelado */
      }
    }
  }

  return (
    <div className="-mx-4 -mt-2 flex flex-col h-full min-h-0">
      {/* Hero */}
      <div className="relative shrink-0">
        <ImageCarousel
          imagenes={ev.imagenes}
          alt={ev.titulo}
          className="w-full aspect-[4/3] vertical-tablet:aspect-[16/10]"
        />
        <button
          onClick={onBack}
          className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md active:scale-95"
          aria-label={t('common.back', lang)}
        >
          <ArrowLeft size={18} className="text-km0-blue-900" />
        </button>
        <button
          onClick={share}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md active:scale-95"
          aria-label="Compartir"
        >
          <Share2 size={16} className="text-km0-blue-900" />
        </button>
      </div>

      {/* Cuerpo scroll-y */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pt-4 pb-4 space-y-4">
        {/* Título + badges */}
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {ev.categoria && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-km0-yellow-400 text-km0-blue-900 text-[10px] font-ui font-bold">
                {ev.categoria}
              </span>
            )}
            {ev.esGratuito ? (
              <span className="inline-block px-2 py-0.5 rounded-full bg-km0-teal-500 text-white text-[10px] font-ui font-bold">
                {t('event.free', lang)}
              </span>
            ) : ev.precio != null ? (
              <span className="inline-block px-2 py-0.5 rounded-full bg-km0-blue-100 text-km0-blue-900 text-[10px] font-ui font-bold">
                {ev.precio.toFixed(2)} €
              </span>
            ) : null}
            {ev.esFamilia && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-km0-coral-500 text-white text-[10px] font-ui font-bold">
                {t('event.family', lang)}
              </span>
            )}
          </div>
          <h1 className="font-brand text-xl vertical-tablet:text-2xl text-km0-blue-900 leading-tight">
            {ev.titulo}
          </h1>
        </header>

        {/* Cuándo */}
        <section className="bg-white border border-km0-blue-100 rounded-2xl p-3 space-y-2">
          <h2 className="font-brand text-[11px] uppercase tracking-widest text-km0-blue-700/70">
            {t('event.when', lang)}
          </h2>
          <ul className="space-y-1.5">
            {horarios.map((h, i) => {
              const { fecha, hora } = formatRango(
                h.fechaInicio,
                h.fechaFin,
                h.horaInicio,
                h.horaFin
              )
              if (!fecha && !hora) return null
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 text-km0-blue-900"
                >
                  <Calendar
                    size={14}
                    className="text-km0-teal-600 shrink-0 mt-0.5"
                  />
                  <div className="font-ui text-xs leading-snug">
                    {fecha && <div className="font-bold">{fecha}</div>}
                    {hora && (
                      <div className="text-km0-blue-700/80 inline-flex items-center gap-1">
                        <Clock size={11} /> {hora}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Dónde */}
        {(ev.lugar || ev.direccion || ev.poblacion) && (
          <section className="bg-white border border-km0-blue-100 rounded-2xl p-3 space-y-2">
            <h2 className="font-brand text-[11px] uppercase tracking-widest text-km0-blue-700/70">
              {t('event.where', lang)}
            </h2>
            <div className="flex items-start gap-2 text-km0-blue-900">
              <MapPin size={14} className="text-km0-teal-600 shrink-0 mt-0.5" />
              <div className="font-ui text-xs leading-snug">
                {ev.lugar && <div className="font-bold">{ev.lugar}</div>}
                {(ev.direccion || ev.poblacion) && (
                  <div className="text-km0-blue-700/80">
                    {[ev.direccion, ev.poblacion, ev.cp]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Descripción */}
        {ev.descripcion && (
          <section className="space-y-1.5">
            <h2 className="font-brand text-[11px] uppercase tracking-widest text-km0-blue-700/70 px-0.5">
              {t('event.description', lang)}
            </h2>
            <p className="font-body text-sm text-km0-blue-900/90 leading-relaxed whitespace-pre-line">
              {ev.descripcion}
            </p>
          </section>
        )}

        {/* Organizador */}
        {ev.organizador && (
          <section className="bg-white border border-km0-blue-100 rounded-2xl p-3">
            <h2 className="font-brand text-[11px] uppercase tracking-widest text-km0-blue-700/70 mb-1.5">
              {t('event.organizer', lang)}
            </h2>
            <div className="flex items-start gap-2 text-km0-blue-900">
              <Building2
                size={14}
                className="text-km0-teal-600 shrink-0 mt-0.5"
              />
              <div className="font-ui text-xs leading-snug flex-1 min-w-0">
                <div className="font-bold break-words">{ev.organizador}</div>
                {ev.organizadorWeb && (
                  <a
                    href={ev.organizadorWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-km0-coral-500 underline underline-offset-2 break-all inline-flex items-center gap-1"
                  >
                    <ExternalLink size={11} />
                    {ev.organizadorWeb.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Tags */}
        {ev.tags.length > 0 && (
          <section className="space-y-1.5">
            <h2 className="font-brand text-[11px] uppercase tracking-widest text-km0-blue-700/70 px-0.5">
              {t('event.tags', lang)}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {ev.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700 border border-km0-blue-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA sticky */}
      {ev.fuenteUrl && (
        <div className="px-4 pb-3 pt-2 shrink-0 bg-km0-beige-50/95 backdrop-blur border-t border-km0-blue-100 flex gap-2">
          <a
            href={ev.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 rounded-full font-ui font-bold text-sm inline-flex items-center justify-center gap-1.5 active:scale-95 transition-transform bg-km0-blue-900 text-white"
          >
            <ExternalLink size={14} /> {t('event.source', lang)}
          </a>
          <button
            onClick={share}
            className="w-11 h-11 rounded-full bg-white border border-km0-blue-200 text-km0-blue-900 inline-flex items-center justify-center active:scale-95 shrink-0"
            aria-label="Compartir"
          >
            <Share2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Estados wrapper ─────────────────────────────────────────── */
const StateWrapper = ({
  children,
  onBack,
}: {
  children: React.ReactNode
  onBack: () => void
}) => (
  <div className="flex flex-col h-full min-h-0">
    <div className="shrink-0 mb-2">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-white border border-km0-blue-200 flex items-center justify-center active:scale-95"
        aria-label="Volver"
      >
        <ArrowLeft size={18} className="text-km0-blue-900" />
      </button>
    </div>
    <div className="flex-1 min-h-0 flex items-center justify-center">
      {children}
    </div>
  </div>
)

/* ─── Página ─────────────────────────────────────────────────── */
const Evento = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const id = searchParams.get('id')

  const [data, setData] = useState<EventoDetalleAdaptado | null>(null)
  const [loading, setLoading] = useState<boolean>(!!id)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    getEvento(id, lang === 'ca' ? 'ca' : 'es')
      .then((res) => {
        if (cancelled) return
        if (!res) setNotFound(true)
        else setData(res)
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
  }, [id, lang])

  const onBack = () => navigate(-1)

  return (
    <BrandedFrame
      hideHeader
      portraitContentClassName="!overflow-hidden !pb-0"
      landscapeContentClassName="!pb-0"
    >
      {loading ? (
        <StateWrapper onBack={onBack}>
          <div className="flex flex-col items-center gap-2 text-km0-blue-700">
            <Loader2 size={28} className="animate-spin" />
            <span className="font-ui text-xs">{t('common.loading', lang)}</span>
          </div>
        </StateWrapper>
      ) : error ? (
        <StateWrapper onBack={onBack}>
          <div className="text-center max-w-xs">
            <AlertTriangle
              size={32}
              className="mx-auto text-km0-coral-500 mb-2"
            />
            <p className="font-brand text-sm text-km0-blue-900 mb-1">
              {t('event.error.title', lang)}
            </p>
            <p className="text-[11px] font-ui text-km0-blue-700/70 break-words">
              {error}
            </p>
          </div>
        </StateWrapper>
      ) : notFound || !data ? (
        <StateWrapper onBack={onBack}>
          <div className="text-center max-w-xs">
            <Calendar size={32} className="mx-auto text-km0-blue-700/50 mb-2" />
            <p className="font-brand text-sm text-km0-blue-900 mb-1">
              {t('event.notfound.title', lang)}
            </p>
            <p className="text-[11px] font-ui text-km0-blue-700/70">
              {t('event.notfound.subtitle', lang)}
            </p>
          </div>
        </StateWrapper>
      ) : (
        <EventoDetalle ev={data} onBack={onBack} />
      )}
    </BrandedFrame>
  )
}

export default Evento
