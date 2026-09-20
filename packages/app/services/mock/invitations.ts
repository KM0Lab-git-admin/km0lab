import {
  INVITATIONS_MOCK,
  INVITATIONS_MOCK_PENDING,
} from '../../data/invitationsMock'
import type {
  InvitationRecord,
  InvitationsSummary,
} from '../../types/invitation'

/**
 * Servicio MOCK del seguimiento de invitaciones.
 *
 * PENDIENTE DE BACKEND: sustituir por el endpoint real de registros
 * atribuidos al usuario (GET /api/v1/referrals/me o equivalente). El backend
 * es quien resuelve la atribuci+�n y el abono de los puntos; aqu+� no se
 * escribe nada ni se conceden puntos reales.
 */
export type InvitationsVariant = 'default' | 'pending' | 'empty'

export const fetchInvitations = async (
  variant: InvitationsVariant = 'default'
): Promise<InvitationRecord[]> => {
  await new Promise((resolve) => setTimeout(resolve, 150))
  if (variant === 'empty') return []
  if (variant === 'pending') return INVITATIONS_MOCK_PENDING
  return INVITATIONS_MOCK
}

/** Resumen derivado: los puntos pendientes no suman a -�Punts guanyats-+. */
export const summarizeInvitations = (
  records: InvitationRecord[]
): InvitationsSummary =>
  records.reduce<InvitationsSummary>(
    (acc, record) => {
      const registered =
        record.status === 'granted' || record.status === 'pending'
      if (registered && record.kind === 'person') acc.personsRegistered += 1
      if (registered && record.kind === 'business')
        acc.businessesRegistered += 1
      if (record.status === 'granted') acc.pointsEarned += record.points
      if (record.status === 'pending') acc.pointsPending += record.points
      return acc
    },
    {
      personsRegistered: 0,
      businessesRegistered: 0,
      pointsEarned: 0,
      pointsPending: 0,
    }
  )

/** Resumen +�nico del piloto, compartido por Home, puntos y seguimiento. */
export const INVITATIONS_MOCK_SUMMARY = summarizeInvitations(INVITATIONS_MOCK)
