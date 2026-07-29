/**
 * Reclamo de puntos por acciones de catálogo (aniversario, …).
 */
import { apiFetch, claimPointsSchema, type ClaimPoints } from './km0labClient'

export const claimBirthday = async (): Promise<ClaimPoints | null> => {
  try {
    return await apiFetch('/points/claim-birthday', {
      method: 'POST',
      auth: true,
      schema: claimPointsSchema,
    })
  } catch {
    return null
  }
}
