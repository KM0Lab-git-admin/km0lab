import type { TKey } from '../utils/i18n'

export type PointsTxType =
  | 'signup'
  | 'first_scan'
  | 'scan'
  | 'web_visit'
  | 'event_signup'
  | 'survey'
  | 'suggestion'
  | 'redeem'

export type PointActionId =
  | 'birthday'
  | 'signup'
  | 'first_scan'
  | 'scan'
  | 'web_visit'
  | 'newsletter'
  | 'event_signup'
  | 'survey'

export type PointActionIcon =
  | 'cake'
  | 'user-plus'
  | 'star'
  | 'qr'
  | 'globe'
  | 'mail'
  | 'calendar-check'
  | 'clipboard-list'

export interface PointAction {
  id: PointActionId
  titleKey: TKey
  descriptionKey: TKey
  typeKey: TKey
  points: number
  completed: boolean
  icon: PointActionIcon
}

export interface PointsTransaction {
  id: string
  type: PointsTxType
  /** Clave i18n del concepto (ej. "points.history.type.scan"). */
  conceptKey: TKey
  /** Establecimiento o acción concreta. */
  place?: string
  /** ISO 8601. */
  date: string
  /** Positivos → ganados, negativos → gastados. */
  points: number
}
