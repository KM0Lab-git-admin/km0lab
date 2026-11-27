import { t, type Lang, NotificationItem } from '@km0lab/app'
import { Button, Skeleton } from '@km0lab/ui'
import { ArrowRight, RefreshCw, Newspaper } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import BubbleSheet from '@/components/BubbleSheet'
import { cn } from '@/lib/utils'

interface NotificationsOverlayProps {
  open: boolean
  items: NotificationItem[]
  loading: boolean
  error: string | null
  lang: Lang
  onClose: () => void
  onReload: () => void
  container?: HTMLElement | null
}

const formatRelative = (iso: string | null, lang: Lang): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'en' ? 'en-GB' : 'es-ES'
  return d
    .toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    .replace(/^\w/, (c) => c.toUpperCase())
}

const NotificationsOverlay = ({
  open,
  items,
  loading,
  error,
  lang,
  onClose,
  onReload,
  container,
}: NotificationsOverlayProps) => {
  const navigate = useNavigate()

  const handleOpen = (item: NotificationItem) => {
    onClose()
    navigate(`/news?id=${encodeURIComponent(item.noticia.id)}`)
  }

  return (
    <BubbleSheet
      open={open}
      onClose={onClose}
      title={t('notifications.title', lang)}
      lang={lang}
      container={container}
    >
      <div className="space-y-3">
        {loading && items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-2">
            <Skeleton className="h-20 w-full rounded-[20px]" />
            <Skeleton className="h-20 w-full rounded-[20px]" />
            <p className="font-body text-sm text-km0-blue-700/70">
              {t('notifications.loading', lang)}
            </p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
            <p className="font-ui text-km0-blue-700 text-base">
              {t('notifications.error.title', lang)}
            </p>
            <Button
              variant="bubbleTertiary"
              type="button"
              onClick={onReload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-km0-blue-700 text-primary-foreground font-ui text-sm active:scale-95 transition"
            >
              <RefreshCw size={14} strokeWidth={2.5} />
              {t('notifications.error.retry', lang)}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-2">
            <Newspaper className="w-8 h-8 text-km0-blue-700/50" />
            <p className="font-ui text-km0-blue-700 text-lg">
              {t('notifications.empty.title', lang)}
            </p>
            <p className="font-body text-km0-blue-700/70 text-sm">
              {t('notifications.empty.hint', lang)}
            </p>
          </div>
        ) : (
          items.map((item) => {
            const { noticia, read } = item
            const titulo = noticia.titulo[lang] || noticia.titulo.es
            const resumen = noticia.resumen[lang] || noticia.resumen.es
            return (
              <Button
                variant="bubbleTertiary"
                key={noticia.id}
                type="button"
                onClick={() => handleOpen(item)}
                className={cn(
                  'h-auto w-full whitespace-normal text-left rounded-[20px] bg-card p-3 shadow-[var(--shadow-bubble)] transition active:scale-[0.96]',
                  read ? 'bg-card' : 'bg-card'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Miniatura */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-km0-beige-100 shrink-0 flex items-center justify-center">
                    {noticia.imagenUrl ? (
                      <img
                        src={noticia.imagenUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Newspaper className="w-5 h-5 text-km0-blue-700/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={cn(
                          'font-ui text-sm text-km0-blue-700 line-clamp-2',
                          !read && 'font-brand'
                        )}
                      >
                        {titulo}
                      </h3>
                      {!read && (
                        <span
                          aria-hidden
                          className="mt-1 w-2.5 h-2.5 rounded-full bg-km0-coral-400 shrink-0"
                        />
                      )}
                    </div>
                    {resumen && (
                      <p className="font-body text-xs text-km0-blue-700/70 mt-1 line-clamp-2">
                        {resumen}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-body text-[11px] text-km0-blue-700/60">
                        {formatRelative(noticia.fechaPublicacion, lang)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-ui text-xs text-km0-teal-600">
                        {t('notifications.item.cta', lang)}
                        <ArrowRight size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            )
          })
        )}
      </div>
    </BubbleSheet>
  )
}
export default NotificationsOverlay
