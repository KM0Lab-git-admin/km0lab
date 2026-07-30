import type { PointsHistoryItemOut } from '../services/km0labClient'
import type { PointsTransaction, PointsTxType } from '../types/points'

const API_TYPE_TO_TX: Record<string, PointsTxType> = {
  welcome: 'welcome',
  action: 'action',
  redemption: 'redeem',
  signup: 'signup',
  scan: 'scan',
  first_scan: 'first_scan',
  web_visit: 'web_visit',
  event_signup: 'event_signup',
  survey: 'survey',
  suggestion: 'suggestion',
  redeem: 'redeem',
}

/** Mapea un item del ledger API a PointsTransaction de UI. */
export function toPointsTransaction(
  item: PointsHistoryItemOut
): PointsTransaction {
  const type =
    API_TYPE_TO_TX[item.type] ?? (item.points < 0 ? 'redeem' : 'action')
  const concept =
    item.title?.trim() ||
    item.description?.trim() ||
    item.reward_name?.trim() ||
    undefined
  const place =
    item.shop_name?.trim() ||
    (item.reward_name && item.reward_name !== concept
      ? item.reward_name.trim()
      : undefined) ||
    undefined

  return {
    id: item.id,
    type,
    concept,
    place,
    date: item.created_at,
    points: item.points,
  }
}
