import type { TKey } from '../utils/i18nProd'

export type PointsTxType =
  | 'signup'
  | 'first_scan'
  | 'scan'
  | 'web_visit'
  | 'event_signup'
  | 'survey'
  | 'suggestion'
  | 'invitation'
  | 'invite_person'
  | 'invite_business'
  | 'demo_credit'
  | 'redeem'

export type PointActionId = 'signup' | 'scan' | 'invite_friend'

export type PointActionIcon = 'user-plus' | 'qr' | 'share'

export interface PointAction {
  id: string
  apiType: string
  title?: string
  description?: string
  earnedPoints?: number
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

export interface PointsHistorySummary {
  balance: number
  earnedTotal: number
  spentTotal: number
  items: PointsTransaction[]
}
