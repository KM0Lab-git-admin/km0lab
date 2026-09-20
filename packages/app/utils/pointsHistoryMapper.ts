import type { TKey } from './i18nProd'
import type { PointsHistoryItemOut } from '../services/km0labClient'
import type { PointsTransaction, PointsTxType } from '../types/points'

const API_TYPE_TO_TX: Record<string, PointsTxType> = {
  welcome: 'signup',
  action: 'scan',
  redemption: 'redeem',
  signup: 'signup',
  scan: 'scan',
  first_scan: 'first_scan',
  web_visit: 'web_visit',
  event_signup: 'event_signup',
  survey: 'survey',
  suggestion: 'suggestion',
  redeem: 'redeem',
  invite_person: 'invite_person',
  invite_business: 'invite_business',
}

const TYPE_TO_CONCEPT: Record<PointsTxType, TKey> = {
  signup: 'points.history.type.signup',
  first_scan: 'points.history.type.first_scan',
  scan: 'points.history.type.scan',
  web_visit: 'points.history.type.web_visit',
  event_signup: 'points.history.type.event_signup',
  survey: 'points.history.type.survey',
  suggestion: 'points.history.type.suggestion',
  redeem: 'points.history.type.redeem',
  invite_person: 'points.history.type.invite_person',
  invite_business: 'points.history.type.invite_business',
}

/** Mapea un item del ledger API a PointsTransaction de UI. */
export function toPointsTransaction(
  item: PointsHistoryItemOut
): PointsTransaction {
  const type =
    API_TYPE_TO_TX[item.type] ?? (item.points < 0 ? 'redeem' : 'scan')
  const isInvite = type === 'invite_person' || type === 'invite_business'
  const place = isInvite
    ? undefined
    : item.shop_name?.trim() ||
      item.reward_name?.trim() ||
      item.title?.trim() ||
      undefined

  return {
    id: item.id,
    type,
    conceptKey: TYPE_TO_CONCEPT[type],
    place,
    date: item.created_at,
    points: item.points,
  }
}
