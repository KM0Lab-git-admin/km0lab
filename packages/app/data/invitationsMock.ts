import type { InvitationRecord } from '../types/invitation'

import { INVITE_REWARDS } from './inviteConfig'

/**
 * Datos SIMULADOS del seguimiento de invitaciones (piloto frontend).
 * Coherencia del ejemplo: 2 personas + 1 negocio registrados = 700 punts.
 */
const now = new Date()
const iso = (daysAgo: number, hour = 11, minute = 0): string => {
  const d = new Date(now)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const INVITATIONS_MOCK: InvitationRecord[] = [
  {
    id: 'inv-01',
    kind: 'business',
    status: 'granted',
    displayName: 'Forn de la Plaça',
    startedAt: iso(9, 10, 20),
    completedAt: iso(8, 12, 5),
    grantedAt: iso(8, 12, 40),
    points: INVITE_REWARDS.business,
  },
  {
    id: 'inv-02',
    kind: 'person',
    status: 'granted',
    displayName: null,
    startedAt: null,
    completedAt: iso(5, 18, 30),
    grantedAt: iso(5, 18, 35),
    points: INVITE_REWARDS.person,
  },
  {
    id: 'inv-03',
    kind: 'person',
    status: 'granted',
    displayName: 'Marta G.',
    startedAt: iso(3, 9, 0),
    completedAt: iso(3, 9, 12),
    grantedAt: iso(3, 9, 20),
    points: INVITE_REWARDS.person,
  },
  {
    id: 'inv-04',
    kind: 'person',
    status: 'started',
    displayName: null,
    startedAt: iso(1, 20, 10),
    completedAt: null,
    grantedAt: null,
    points: INVITE_REWARDS.person,
  },
]

/** Variante con una recompensa todavía procesándose. */
export const INVITATIONS_MOCK_PENDING: InvitationRecord[] = [
  {
    id: 'inv-05',
    kind: 'business',
    status: 'pending',
    displayName: 'Floristeria Mar',
    startedAt: iso(1, 9, 0),
    completedAt: iso(0, 10, 15),
    grantedAt: null,
    points: INVITE_REWARDS.business,
  },
  ...INVITATIONS_MOCK.slice(1),
]
