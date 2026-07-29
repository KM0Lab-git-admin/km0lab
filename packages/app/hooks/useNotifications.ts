/**
 * useNotifications — deriva notificaciones a partir de las noticias
 * municipales (`/api/v1/news`).
 *
 * Regla de lectura:
 *  - Si el usuario nunca ha abierto el panel (`notificationsLastSeenAt`
 *    es null) y hay noticias → todas se consideran no leídas.
 *  - Si sí lo ha abierto, una noticia es no leída cuando
 *    `fechaPublicacion > notificationsLastSeenAt`.
 *  - Al abrir el panel se llama a `markAllSeen()` que actualiza el
 *    timestamp a `now()` en el store persistido.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAppStore } from '../stores/useAppStore'
import { useProfile } from '../hooks/useProfile'
import { listNews, type Noticia } from '../services/newsApi'

export interface NotificationItem {
  noticia: Noticia
  read: boolean
}

const DEFAULT_CITY = 'Malgrat de Mar'

export const useNotifications = () => {
  const { profile } = useProfile()
  const storeTown = useAppStore((s) => s.town)
  const lastSeenAt = useAppStore((s) => s.notificationsLastSeenAt)
  const markNotificationsSeen = useAppStore((s) => s.markNotificationsSeen)

  const city = profile?.town || storeTown || DEFAULT_CITY

  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listNews({ city, limit: 20, offset: 0 })
      .then((res) => {
        if (cancelled) return
        setNoticias(res.noticias)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setNoticias([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [city])

  useEffect(() => {
    const cancel = load()
    return cancel
  }, [load])

  const items = useMemo<NotificationItem[]>(() => {
    const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : null
    return noticias.map((noticia) => {
      const pubMs = noticia.fechaPublicacion
        ? new Date(noticia.fechaPublicacion).getTime()
        : null
      let read = false
      if (lastSeenMs !== null) {
        // Sin fecha → considerar leída si ya se abrió alguna vez.
        read = pubMs === null || pubMs <= lastSeenMs
      }
      return { noticia, read }
    })
  }, [noticias, lastSeenAt])

  const hasUnread = useMemo(() => items.some((i) => !i.read), [items])

  const markAllSeen = useCallback(() => {
    markNotificationsSeen()
  }, [markNotificationsSeen])

  return {
    items,
    hasUnread,
    loading,
    error,
    reload: load,
    markAllSeen,
    /** @deprecated compat con llamadas antiguas (Agenda/Noticias). */
    markAllRead: markAllSeen,
  }
}
