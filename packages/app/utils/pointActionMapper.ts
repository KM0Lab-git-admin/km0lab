import type { TKey } from './i18nProd'
import type { PointActionOut } from '../services/km0labClient'
import type {
  PointAction,
  PointActionIcon,
  PointActionId,
} from '../types/points'

type ActionKeys = {
  id: PointActionId
  typeKey: TKey
  titleKey: TKey
  descriptionKey: TKey
  icon: PointActionIcon
}

/** Mapa type de API → ids/claves i18n + icono de UI. */
export const TYPE_TO_KEYS: Record<string, ActionKeys> = {
  birthday: {
    id: 'birthday',
    typeKey: 'points.actions.type.birthday',
    titleKey: 'points.actions.birthday.title',
    descriptionKey: 'points.actions.birthday.description',
    icon: 'cake',
  },
  signup: {
    id: 'signup',
    typeKey: 'points.actions.type.signup',
    titleKey: 'points.actions.signup.title',
    descriptionKey: 'points.actions.signup.description',
    icon: 'user-plus',
  },
  qr_scan: {
    id: 'scan',
    typeKey: 'points.actions.type.qr_scan',
    titleKey: 'points.actions.qr_scan.title',
    descriptionKey: 'points.actions.qr_scan.description',
    icon: 'qr',
  },
  first_scan: {
    id: 'first_scan',
    typeKey: 'points.actions.type.first_scan',
    titleKey: 'points.actions.first_scan.title',
    descriptionKey: 'points.actions.first_scan.description',
    icon: 'star',
  },
  scan: {
    id: 'scan',
    typeKey: 'points.actions.type.scan',
    titleKey: 'points.actions.scan.title',
    descriptionKey: 'points.actions.scan.description',
    icon: 'qr',
  },
  web_visit: {
    id: 'web_visit',
    typeKey: 'points.actions.type.web_visit',
    titleKey: 'points.actions.web_visit.title',
    descriptionKey: 'points.actions.web_visit.description',
    icon: 'globe',
  },
  web_signup: {
    id: 'newsletter',
    typeKey: 'points.actions.type.web_signup',
    titleKey: 'points.actions.web_signup.title',
    descriptionKey: 'points.actions.web_signup.description',
    icon: 'mail',
  },
  newsletter: {
    id: 'newsletter',
    typeKey: 'points.actions.type.newsletter',
    titleKey: 'points.actions.newsletter.title',
    descriptionKey: 'points.actions.newsletter.description',
    icon: 'mail',
  },
  event: {
    id: 'event_signup',
    typeKey: 'points.actions.type.event',
    titleKey: 'points.actions.event.title',
    descriptionKey: 'points.actions.event.description',
    icon: 'calendar-check',
  },
  event_signup: {
    id: 'event_signup',
    typeKey: 'points.actions.type.event_signup',
    titleKey: 'points.actions.event_signup.title',
    descriptionKey: 'points.actions.event_signup.description',
    icon: 'calendar-check',
  },
  custom: {
    id: 'survey',
    typeKey: 'points.actions.type.custom',
    titleKey: 'points.actions.custom.title',
    descriptionKey: 'points.actions.custom.description',
    icon: 'clipboard-list',
  },
  survey: {
    id: 'survey',
    typeKey: 'points.actions.type.survey',
    titleKey: 'points.actions.survey.title',
    descriptionKey: 'points.actions.survey.description',
    icon: 'clipboard-list',
  },
}

const FALLBACK: ActionKeys = {
  id: 'scan',
  typeKey: 'points.actions.type.scan',
  titleKey: 'points.actions.scan.title',
  descriptionKey: 'points.actions.scan.description',
  icon: 'star',
}

/** Mapea PointActionOut de API a PointAction de UI (completed=false). */
export function toPointAction(out: PointActionOut): PointAction {
  const keys = TYPE_TO_KEYS[out.type] ?? FALLBACK
  return {
    id: out.id,
    title: out.name?.trim() ?? '',
    description: out.description?.trim() ?? '',
    titleKey: keys.titleKey,
    descriptionKey: keys.descriptionKey,
    typeKey: keys.typeKey,
    points: out.points,
    completed: false,
    icon: keys.icon,
  }
}
