import type { TKey } from './i18n'
import type { PointActionOut } from '../services/km0labClient'
import type { PointAction, PointActionIcon } from '../types/points'

type ActionKeys = {
  typeKey: TKey
  icon: PointActionIcon
}

/** Mapa type de API → chip i18n + icono de UI. */
export const TYPE_TO_KEYS: Record<string, ActionKeys> = {
  birthday: {
    typeKey: 'points.actions.type.birthday',
    icon: 'cake',
  },
  signup: {
    typeKey: 'points.actions.type.signup',
    icon: 'user-plus',
  },
  qr_scan: {
    typeKey: 'points.actions.type.qr_scan',
    icon: 'qr',
  },
  web_visit: {
    typeKey: 'points.actions.type.web_visit',
    icon: 'globe',
  },
  web_signup: {
    typeKey: 'points.actions.type.web_signup',
    icon: 'mail',
  },
  event: {
    typeKey: 'points.actions.type.event',
    icon: 'calendar-check',
  },
  custom: {
    typeKey: 'points.actions.type.custom',
    icon: 'clipboard-list',
  },
}

/** Mapea PointActionOut de API a PointAction de UI (completed=false). */
export function toPointAction(out: PointActionOut): PointAction {
  const keys = TYPE_TO_KEYS[out.type]
  return {
    id: out.id,
    type: out.type,
    // Textos ya traducidos por la API según `lang`.
    title: out.name,
    description: out.description,
    typeKey: keys?.typeKey,
    points: out.points,
    completed: false,
    icon: keys?.icon ?? 'star',
  }
}
