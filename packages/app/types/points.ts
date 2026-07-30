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
  | 'qr_scan'
  | 'first_scan'
  | 'scan'
  | 'web_visit'
  | 'web_signup'
  | 'newsletter'
  | 'event'
  | 'event_signup'
  | 'custom'
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
  /** UUID de API o id mock legado. */
  id: string
  /** Tipo de acción de API (birthday, qr_scan, …). */
  type?: PointActionId | string
  titleKey?: TKey
  descriptionKey?: TKey
  typeKey?: TKey
  /** Override de título cuando no hay clave i18n (fallback API). */
  title?: string
  /** Override de descripción cuando no hay clave i18n (fallback API). */
  description?: string
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
