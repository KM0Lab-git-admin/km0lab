/**
 * Demo KM0 — población ficticia (CP 00000).
 *
 * Catálogo KM0 (acciones/premios/shops) vive en el town Demo vía API.
 * Agenda/noticias y otros datos municipales caen a Malgrat si faltan.
 */

import { useAppStore } from '../stores/useAppStore'

import { showcaseHomeTown } from './showcase'

export const DEMO_POSTAL_CODE = '00000'
export const DEMO_TOWN_NAME = 'Demo KM0'
/** Cuentas con OTP fijo `123456` en local/staging (API). */
const FIXED_OTP_EMAILS = new Set([
  'resident@km0lab.com',
  'merchant@km0lab.com',
  'admin@km0lab.com',
  'admin-malgrat@km0lab.com',
  'merchant1-malgrat@km0lab.com',
  'merchant2-malgrat@km0lab.com',
])

/** Cuentas Demo KM0 (pueblo 00000, is_fake). */
const DEMO_EMAILS = new Set([
  'resident@km0lab.com',
  'merchant@km0lab.com',
  'admin@km0lab.com',
])

export const isDemoEmail = (email: string | null | undefined): boolean =>
  DEMO_EMAILS.has((email ?? '').trim().toLowerCase())

export const isFixedOtpEmail = (email: string | null | undefined): boolean =>
  FIXED_OTP_EMAILS.has((email ?? '').trim().toLowerCase())
/** Nombre que entiende events-query / news para el fallback municipal. */
export const MALGRAT_CONTENT_TOWN = 'Malgrat de Mar'

export const isDemoPostalCode = (
  postalCode: string | null | undefined
): boolean => (postalCode ?? '').trim() === DEMO_POSTAL_CODE

/**
 * Población a pedir a agenda/noticias.
 * En la demostración es la población elegida en la lista; si no se eligió
 * ninguna (una app anterior a la lista), Demo KM0 hereda el contenido de
 * Malgrat.
 */
export function contentPoblacion(
  postalCode: string | null | undefined,
  townName: string | null | undefined
): string {
  if (isDemoPostalCode(postalCode)) {
    const { showcaseChoice, showcaseHomeTownId } = useAppStore.getState()
    const chosen = showcaseHomeTown(showcaseChoice, showcaseHomeTownId)
    return chosen?.name.trim() || MALGRAT_CONTENT_TOWN
  }
  const name = (townName ?? '').trim()
  return name || MALGRAT_CONTENT_TOWN
}
