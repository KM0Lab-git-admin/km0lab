import { useEffect, useState } from 'react'
import { listEvents, type AgendaEvent } from '../services/eventsApi'
import type { Promo } from '../types/promo'
import { useAppStore } from '../stores/useAppStore'

/**
 * useFeaturedPromos — obtiene los N primeros eventos de la API y los
 * adapta al shape `Promo` que consume `EventHeroCarousel`.
 *
 * Solo lectura. Si la API falla o no devuelve nada, el hook devuelve una
 * lista vacía; el consumidor decide el fallback (por ejemplo, ocultar la
 * sección o mostrar los PROMOS mock).
 */
const GRADIENTS = [
  'from-km0-blue-800 via-km0-blue-700 to-km0-blue-900',
  'from-km0-teal-700 via-km0-teal-600 to-km0-blue-800',
  'from-km0-yellow-400 via-km0-coral-400 to-km0-coral-500',
  'from-km0-coral-500 via-km0-coral-400 to-km0-blue-700',
]

function formatDateRange(ev: AgendaEvent, lang: 'es' | 'ca' | 'en'): string {
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  const start = ev.fecha_inicio ? new Date(ev.fecha_inicio) : null
  const end = ev.fecha_fin ? new Date(ev.fecha_fin) : null
  if (!start || Number.isNaN(start.getTime())) return ''

  const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' })
  const startStr = fmt.format(start)

  if (
    end &&
    !Number.isNaN(end.getTime()) &&
    end.toDateString() !== start.toDateString()
  ) {
    const endStr = fmt.format(end)
    return lang === 'es'
      ? `Del ${startStr} al ${endStr}`
      : lang === 'ca'
        ? `Del ${startStr} al ${endStr}`
        : `From ${startStr} to ${endStr}`
  }

  if (ev.hora_inicio) return `${startStr} · ${ev.hora_inicio.slice(0, 5)}`
  return startStr
}

function toPromo(
  ev: AgendaEvent,
  index: number,
  lang: 'es' | 'ca' | 'en'
): Promo {
  return {
    id: ev.id_unico_evento,
    title: ev.titulo,
    dateRange: formatDateRange(ev, lang),
    location: ev.lugar_nombre || ev.poblacion_nombre || '',
    badge: {
      text: ev.categorias?.[0] ?? '',
      bg: 'bg-km0-blue-700',
      text_color: 'text-white',
    },
    gradient: GRADIENTS[index % GRADIENTS.length] ?? '',
    images: ev.url_imagen ? [ev.url_imagen] : [],
  }
}

export function useFeaturedPromos(limit = 4): {
  promos: Promo[]
  loading: boolean
  error: string | null
} {
  const lang = useAppStore((s) => s.lang)
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listEvents({
      pageSize: limit,
      page: 1,
      lang: lang === 'ca' ? 'ca' : 'es',
    })
      .then((res) => {
        if (cancelled) return
        const mapped = (res.eventos ?? [])
          .slice(0, limit)
          .map((ev, i) => toPromo(ev, i, lang))
        setPromos(mapped)
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
  }, [limit, lang])

  return { promos, loading, error }
}
