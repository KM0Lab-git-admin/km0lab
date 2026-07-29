import type { PointAction } from '@km0lab/app'

/**
 * Acciones disponibles para ganar puntos en KM0 LAB.
 *
 * MOCK: refleja las acciones configuradas en el panel de puntos.
 * - completed: true → el usuario ya ha obtenido los puntos.
 * - completed: false → acción pendiente por realizar.
 */
export const POINTS_ACTIONS: PointAction[] = [
  {
    id: 'birthday',
    titleKey: 'points.actions.birthday.title',
    descriptionKey: 'points.actions.birthday.description',
    typeKey: 'points.actions.type.birthday',
    points: 10,
    completed: false,
    icon: 'cake',
  },
  {
    id: 'signup',
    titleKey: 'points.actions.signup.title',
    descriptionKey: 'points.actions.signup.description',
    typeKey: 'points.actions.type.signup',
    points: 100,
    completed: true,
    icon: 'user-plus',
  },
  {
    id: 'first_scan',
    titleKey: 'points.actions.first_scan.title',
    descriptionKey: 'points.actions.first_scan.description',
    typeKey: 'points.actions.type.first_scan',
    points: 75,
    completed: true,
    icon: 'star',
  },
  {
    id: 'scan',
    titleKey: 'points.actions.scan.title',
    descriptionKey: 'points.actions.scan.description',
    typeKey: 'points.actions.type.scan',
    points: 50,
    completed: false,
    icon: 'qr',
  },
  {
    id: 'web_visit',
    titleKey: 'points.actions.web_visit.title',
    descriptionKey: 'points.actions.web_visit.description',
    typeKey: 'points.actions.type.web_visit',
    points: 20,
    completed: false,
    icon: 'globe',
  },
  {
    id: 'newsletter',
    titleKey: 'points.actions.newsletter.title',
    descriptionKey: 'points.actions.newsletter.description',
    typeKey: 'points.actions.type.newsletter',
    points: 30,
    completed: false,
    icon: 'mail',
  },
  {
    id: 'event_signup',
    titleKey: 'points.actions.event_signup.title',
    descriptionKey: 'points.actions.event_signup.description',
    typeKey: 'points.actions.type.event_signup',
    points: 40,
    completed: false,
    icon: 'calendar-check',
  },
  {
    id: 'survey',
    titleKey: 'points.actions.survey.title',
    descriptionKey: 'points.actions.survey.description',
    typeKey: 'points.actions.type.survey',
    points: 15,
    completed: false,
    icon: 'clipboard-list',
  },
]
