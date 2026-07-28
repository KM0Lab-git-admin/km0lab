import { t, type Lang } from '@km0lab/app'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Loader2, RefreshCw, Newspaper } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { NotificationItem } from '@km0lab/app'

import { cn } from '@/lib/utils'

interface NotificationsOverlayProps {
  open: boolean
  items: NotificationItem[]
  loading: boolean
  error: string | null
  lang: Lang
  onClose: () => void
  onReload: () => void
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
}: NotificationsOverlayProps) => {
  const navigate = useNavigate()

  const handleOpen = (item: NotificationItem) => {
    onClose()
    navigate(`/noticias?id=${encodeURIComponent(item.noticia.id)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40 bg-km0-blue-900/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer lateral derecho */}
          <motion.aside
            className="absolute top-0 right-0 bottom-0 z-50 w-full bg-km0-beige-50 flex flex-col shadow-2xl rounded-l-3xl overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={t('notifications.title', lang)}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-km0-beige-200 shrink-0">
              <h2 className="font-brand text-2xl text-km0-blue-700">
                {t('notifications.title', lang)}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('notifications.close', lang)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-km0-blue-700 hover:bg-km0-beige-100 active:scale-95 transition"
              >
                <X size={22} strokeWidth={2.4} />
              </button>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loading && items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-2">
                  <Loader2 className="w-6 h-6 text-km0-blue-700 animate-spin" />
                  <p className="font-body text-sm text-km0-blue-700/70">
                    {t('notifications.loading', lang)}
                  </p>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
                  <p className="font-ui text-km0-blue-700 text-base">
                    {t('notifications.error.title', lang)}
                  </p>
                  <button
                    type="button"
                    onClick={onReload}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-km0-blue-700 text-white font-ui text-sm active:scale-95 transition"
                  >
                    <RefreshCw size={14} strokeWidth={2.5} />
                    {t('notifications.error.retry', lang)}
                  </button>
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
                    <button
                      key={noticia.id}
                      type="button"
                      onClick={() => handleOpen(item)}
                      className={cn(
                        'w-full text-left rounded-2xl border p-3 transition active:scale-[0.99]',
                        read
                          ? 'bg-km0-beige-50 border-km0-beige-200'
                          : 'bg-white border-km0-blue-700/20 shadow-sm'
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
                    </button>
                  )
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationsOverlay
