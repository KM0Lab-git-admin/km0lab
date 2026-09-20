import type { TKey } from '../utils/i18nProd'

export type PointsTxType =
  | 'signup'
  | 'first_scan'
  | 'scan'
  | 'web_visit'
  | 'event_signup'
  | 'survey'
  | 'suggestion'
  | 'redeem'
  | 'invite_person'
  | 'invite_business'

export type PointActionId =
  | 'birthday'
  | 'signup'
  | 'first_scan'
  | 'scan'
  | 'web_visit'
  | 'newsletter'
  | 'event_signup'
  | 'survey'
  | 'invite_person'
  | 'invite_business'

export type PointActionIcon =
  | 'cake'
  | 'user-plus'
  | 'star'
  | 'qr'
  | 'globe'
  | 'mail'
  | 'calendar-check'
  | 'clipboard-list'
  | 'share'

export interface PointAction {
  /** UUID de API o id estable del mock Lovable. */
  id: string
  /** Tipo de catálogo API (`signup`, `invite_person`, …). */
  apiType: string
  /** Texto ya traducido por la API (name). Opcional en mocks. */
  title?: string
  /** Texto ya traducido por la API (description). Opcional en mocks. */
  description?: string
  titleKey: TKey
  descriptionKey: TKey
  typeKey: TKey
  points: number
  /** Suma real cobrada en el ledger para este tipo, si hay. */
  earnedPoints?: number
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

export interface PointsHistorySummary {
  balance: number
  earnedTotal: number
  spentTotal: number
  items: PointsTransaction[]
}
