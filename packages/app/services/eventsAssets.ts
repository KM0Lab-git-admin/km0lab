/**
 * Assets estáticos de events-query (/static/images/…).
 *
 * La BD a menudo guarda URLs absolutas al host de prod
 * (`eventquery.km0lab.com`). Al apuntar la app a UAT hay que servir esas
 * rutas desde `VITE_EVENTS_API_URL`, no desde el host embebido en la URL.
 */
import { env } from '../utils/env'

const EVENTS_BASE = env.eventsApiUrl.replace(/\/$/, '')

export function absolutizeEventsAsset(url?: string | null): string | null {
  if (!url) return null
  try {
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url)
      if (parsed.pathname.startsWith('/static/images')) {
        return `${EVENTS_BASE}${parsed.pathname}${parsed.search}`
      }
      return url
    }
  } catch {
    /* URL relativa o inválida → se trata abajo */
  }
  const path = url.startsWith('/') ? url : `/${url}`
  return `${EVENTS_BASE}${path}`
}
