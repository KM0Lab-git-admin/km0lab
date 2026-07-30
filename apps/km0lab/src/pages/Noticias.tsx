import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Newspaper,
  RefreshCw,
} from 'lucide-react'

import DeviceShell from '@/components/DeviceShell'
import HomeHero from '@/components/HomeHero'
import ScreenTitle from '@/components/ScreenTitle'
import { useLang } from '@/contexts/LangContext'
import {
  contentPoblacion,
  listNews,
  t,
  useAppStore,
  useNotifications,
  type Lang,
  type Noticia,
} from '@km0lab/app'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * Noticias — Listado + detalle de noticias municipales.
 *
 * Datos: mientras `/api/v1/news` esté caído, cargamos la fixture
 * `@/data/fixtures/news.json`, la pasamos por `newsListResponseSchema`
 * y adaptamos con `adaptNoticia`.
 *
 * Estados forzables por query param:
 *   · ?state=loading  → skeletons
 *   · ?state=empty    → lista vacía
 *   · ?state=error    → error card + reintentar
 *   · (default)       → happy
 *   · ?id=<id>        → detalle
 * ───────────────────────────────────────────────────────────── */

type ForcedState = 'loading' | 'empty' | 'error' | null

const parseForcedState = (v: string | null): ForcedState => {
  if (v === 'loading' || v === 'empty' || v === 'error') return v
  return null
}

const formatDate = (iso: string | null, lang: Lang): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  return d
    .toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, (c) => c.toUpperCase())
}

/* ─── Tarjeta lista ─────────────────────────────────────────── */
const NoticiaCard = ({
  noticia,
  lang,
  onOpen,
}: {
  noticia: Noticia
  lang: Lang
  onOpen: () => void
}) => {
  const titulo = noticia.titulo[lang]
  const resumen = noticia.resumen[lang]
  const tags = noticia.tags[lang] ?? []
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
        {noticia.imagenUrl ? (
          <div className="aspect-[16/9] w-full bg-km0-blue-50 overflow-hidden">
            <img
              src={noticia.imagenUrl}
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
            <Newspaper size={28} className="text-km0-blue-700/40" />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-brand text-sm leading-tight text-km0-blue-900 mb-1 line-clamp-2">
            {titulo}
          </h3>
          {resumen && (
            <p className="text-[11px] font-ui text-km0-blue-700/80 line-clamp-2 mb-1.5">
              {resumen}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1">
            {noticia.fechaPublicacion && (
              <span className="text-[10px] font-ui text-km0-blue-700/60">
                {formatDate(noticia.fechaPublicacion, lang)}
              </span>
            )}
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>
    </motion.article>
  )
}

const SkeletonCard = () => (
  <div className="bg-white border border-km0-blue-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[16/9] w-full bg-km0-blue-100/60" />
    <div className="p-3">
      <div className="h-4 w-3/4 bg-km0-blue-100/70 rounded mb-2" />
      <div className="h-3 w-full bg-km0-blue-100/50 rounded mb-1.5" />
      <div className="h-3 w-1/3 bg-km0-blue-100/50 rounded" />
    </div>
  </div>
)

/* ─── Detalle ───────────────────────────────────────────────── */
const NoticiaDetail = ({
  noticia,
  lang,
  onBack,
}: {
  noticia: Noticia
  lang: Lang
  onBack: () => void
}) => {
  const titulo = noticia.titulo[lang]
  const cuerpo = noticia.cuerpo[lang]
  const tags = noticia.tags[lang] ?? []
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex flex-col gap-3 w-full h-full min-h-0"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 font-ui text-xs text-km0-blue-700 active:scale-95 transition-transform shrink-0"
      >
        <ArrowLeft size={14} />
        {t('common.back', lang)}
      </button>

      <section
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {noticia.imagenUrl && (
          <div className="aspect-[16/9] w-full bg-km0-blue-50 overflow-hidden rounded-2xl mb-3">
            <img
              src={noticia.imagenUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {noticia.fechaPublicacion && (
          <p className="text-[11px] font-ui text-km0-blue-700/70 mb-1">
            {formatDate(noticia.fechaPublicacion, lang)}
            {noticia.ciudad && ` · ${noticia.ciudad}`}
          </p>
        )}

        <h1 className="font-brand text-lg leading-tight text-km0-blue-900 mb-2">
          {titulo}
        </h1>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-full text-[10px] font-ui bg-km0-blue-50 text-km0-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {cuerpo && (
          <p className="text-xs font-ui text-km0-blue-900/90 whitespace-pre-line leading-relaxed">
            {cuerpo}
          </p>
        )}

        {noticia.fuenteUrl && (
          <a
            href={noticia.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 font-ui text-xs font-bold text-km0-coral-500 underline underline-offset-4 active:scale-95 transition-transform"
          >
            {t('news.detail.source', lang)}
            <ExternalLink size={12} />
          </a>
        )}
      </section>
    </motion.div>
  )
}

/* ─── Página ────────────────────────────────────────────────── */
const Noticias = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useLang()
  const { hasUnread, markAllRead } = useNotifications()
  const postalCode = useAppStore((s) => s.postalCode)
  const town = useAppStore((s) => s.town)
  const poblacion = contentPoblacion(postalCode, town)

  const forced = parseForcedState(searchParams.get('state'))
  const openId = searchParams.get('id')

  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)

    if (forced === 'loading') {
      // Deja el skeleton indefinidamente para inspección visual.
      return
    }
    if (forced === 'error') {
      setLoading(false)
      setError('FORCED_ERROR')
      return
    }
    if (forced === 'empty') {
      setLoading(false)
      setNoticias([])
      return
    }

    let cancelled = false
    // Demo KM0 hereda noticias de Malgrat vía contentPoblacion.
    listNews({ city: poblacion, limit: 20, offset: 0 })
      .then((res) => {
        if (!cancelled) setNoticias(res.noticias)
      })
      .catch((e) => {
        if (!cancelled) {
          setNoticias([])
          setError(e instanceof Error ? e.message : 'Error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [forced, poblacion])

  useEffect(() => {
    const cleanup = load()
    return cleanup
  }, [load])

  const opened = useMemo(
    () => (openId ? (noticias.find((n) => n.id === openId) ?? null) : null),
    [openId, noticias]
  )

  const openNoticia = (id: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('id', id)
    setSearchParams(next, { replace: false })
  }

  const closeDetail = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('id')
    setSearchParams(next, { replace: false })
  }

  const showSkeletons = loading || forced === 'loading'
  const showError = !showSkeletons && !!error
  const showEmpty = !showSkeletons && !error && noticias.length === 0

  const content = (
    <div className="flex flex-col gap-3 w-full h-full min-h-0">
      <div className="-mx-4 -mt-2 shrink-0">
        <HomeHero
          cityName={town || poblacion}
          hasAlerts={hasUnread}
          onToggleAlerts={markAllRead}
          onBack={() => navigate('/home')}
          backAriaLabel={t('common.back', lang)}
          showGreeting={false}
          greetingSlot={<ScreenTitle title={t('news.title', lang)} />}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {opened ? (
          <NoticiaDetail
            key={`detail-${opened.id}`}
            noticia={opened}
            lang={lang}
            onBack={closeDetail}
          />
        ) : (
          <motion.section
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain -mx-4 px-4 pb-4',
              'grid grid-cols-1 gap-3 auto-rows-max'
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
                  {t('news.error.title', lang)}
                </p>
                <p className="text-[11px] font-ui text-km0-coral-700/80 mb-3">
                  {t('news.error.subtitle', lang)}
                </p>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-km0-coral-500 text-white font-ui font-bold text-xs active:scale-95 transition-transform"
                >
                  <RefreshCw size={12} />
                  {t('news.error.retry', lang)}
                </button>
              </div>
            )}

            {showEmpty && (
              <div className="col-span-full bg-white border border-km0-blue-100 rounded-2xl p-5 text-center">
                <Newspaper
                  size={28}
                  className="mx-auto text-km0-blue-700/50 mb-2"
                />
                <p className="font-brand text-sm text-km0-blue-900 mb-1">
                  {t('news.empty.title', lang)}
                </p>
                <p className="text-[11px] font-ui text-km0-blue-700/70">
                  {t('news.empty.subtitle', lang)}
                </p>
              </div>
            )}

            {!showSkeletons &&
              !error &&
              noticias.map((n) => (
                <NoticiaCard
                  key={n.id}
                  noticia={n}
                  lang={lang}
                  onOpen={() => openNoticia(n.id)}
                />
              ))}

            {showSkeletons && (
              <div className="col-span-full flex items-center justify-center pt-2 text-[11px] font-ui text-km0-blue-700/60">
                <Loader2 size={12} className="animate-spin mr-1" />
                {t('common.loading', lang)}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <DeviceShell>
      <div className="flex-1 min-h-0 w-full flex flex-col px-4 pt-5 pb-0 overflow-y-auto overflow-x-hidden">
        {content}
      </div>
    </DeviceShell>
  )
}

export default Noticias
