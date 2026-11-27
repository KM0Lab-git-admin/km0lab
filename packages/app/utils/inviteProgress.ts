import type { InvitationsSummary } from '../types/invitation'

export interface FriendProgress {
  /** Rewarded friends shown against the limit (never above it). */
  count: number
  limit: number
  /** False when this user's invitation earns no points (limit 0). */
  rewarding: boolean
  reached: boolean
}

/** Shared "X of N rewarded friends" rule for every invitation surface. */
export const getFriendProgress = (
  summary: Pick<InvitationsSummary, 'personsRegistered' | 'friendLimit'>
): FriendProgress => {
  const limit = Math.max(0, summary.friendLimit)
  const count = Math.min(summary.personsRegistered, limit)
  return {
    count,
    limit,
    rewarding: limit > 0,
    reached: limit > 0 && count >= limit,
  }
}
