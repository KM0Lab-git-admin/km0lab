import type { TKey } from '../utils/i18n'

export type PointsTxType =
  | 'signup'
  | 'first_scan'
  | 'visit'
  | 'purchase'
  | 'campaign'
  | 'redeem'

export interface PointsTransaction {
  id: string
  type: PointsTxType
  /** Clave i18n del concepto (ej. "points.history.type.visit"). */
  conceptKey: TKey
  /** Establecimiento o acción concreta. */
  place?: string
  /** ISO 8601. */
  date: string
  /** Positivos → ganados, negativos → gastados. */
  points: number
}
