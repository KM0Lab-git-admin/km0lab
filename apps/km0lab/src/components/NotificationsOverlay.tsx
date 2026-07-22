import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { AppNotification } from '@km0lab/app'

import { cn } from '@/lib/utils'

interface NotificationsOverlayProps {
  open: boolean
  notifications: AppNotification[]
  onClose: () => void
  onMarkRead: (id: string) => void
}

const NotificationsOverlay = ({
  open,
  notifications,
  onClose,
  onMarkRead,
}: NotificationsOverlayProps) => {
  const navigate = useNavigate()

  const handleOpen = (n: AppNotification) => {
    if (!n.read) onMarkRead(n.id)
    onClose()
    navigate(n.link)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 bg-km0-beige-50 flex flex-col rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label="Notificaciones"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-km0-beige-200">
            <h2 className="font-brand text-2xl text-km0-blue-700">
              Notificaciones
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar notificaciones"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-km0-blue-700 hover:bg-km0-beige-100 active:scale-95 transition"
            >
              <X size={22} strokeWidth={2.4} />
            </button>
          </header>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
                <p className="font-ui text-km0-blue-700 text-lg">
                  No tienes notificaciones
                </p>
                <p className="font-body text-km0-blue-700/70 text-sm mt-2">
                  Te avisaremos cuando llegue algo nuevo.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleOpen(n)}
                  className={cn(
                    'w-full text-left rounded-2xl border p-4 transition active:scale-[0.99]',
                    n.read
                      ? 'bg-km0-beige-50 border-km0-beige-200'
                      : 'bg-white border-km0-blue-700/20 shadow-sm'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Dot estado */}
                    <span
                      aria-hidden
                      className={cn(
                        'mt-2 w-2.5 h-2.5 rounded-full shrink-0',
                        n.read ? 'bg-km0-beige-300' : 'bg-km0-coral-400'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3
                          className={cn(
                            'font-ui text-base text-km0-blue-700 truncate',
                            !n.read && 'font-brand'
                          )}
                        >
                          {n.title}
                        </h3>
                        <span className="font-body text-xs text-km0-blue-700/60 shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="font-body text-sm text-km0-blue-700/80 mt-1">
                        {n.description}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-3 font-ui text-sm text-km0-teal-600">
                        {n.linkLabel}
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationsOverlay
