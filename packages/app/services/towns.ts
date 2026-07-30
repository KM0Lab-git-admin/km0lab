/**
 * Towns públicos — reglas del municipio para la app residente.
 */
import {
  apiFetch,
  townPublicOutSchema,
  type TownPublicOut,
} from './km0labClient'

/**
 * Config pública del town por código postal (sin auth).
 * Incluye `default_visit_points` (puntos al escanear QR).
 */
export const getPublicTown = async (
  postalCode: string
): Promise<TownPublicOut> => {
  const qs = new URLSearchParams({ postal_code: postalCode })
  return apiFetch(`/towns/public?${qs}`, {
    schema: townPublicOutSchema,
  })
}
