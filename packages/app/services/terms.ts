/**
 * Condiciones del piloto: quién tiene que aceptarlas todavía.
 *
 * De producción (candado en el manifest). Quien se da de alta las acepta en
 * la pantalla del correo. Quien ya tenía cuenta (o sesión abierta) cuando se
 * publicaron no ha aceptado nada: el servidor lo dice en
 * `users.terms_version` y la App le enseña una vez «Antes de continuar»
 * (`TermsGate`). La prueba del consentimiento es esa versión y su fecha.
 */
import { TERMS_VERSION } from '../utils/legalText'

import { apiFetch, userSchema } from './km0labClient'

/**
 * ¿Falta aceptar la versión vigente? `null` es «nunca aceptó nada»; otra
 * versión, «aceptó una anterior». `undefined` es un servidor que todavía no
 * manda el dato: no se pregunta, porque aceptar no cambiaría la respuesta.
 */
export const needsTerms = (accepted: string | null | undefined): boolean =>
  accepted !== undefined && accepted !== TERMS_VERSION

/** Lo que dice el servidor de la cuenta con sesión abierta. */
export const fetchTermsPending = async (): Promise<boolean> => {
  const user = await apiFetch('/users/me', { schema: userSchema, auth: true })
  return needsTerms(user.terms_version)
}

/**
 * Qué pasó al aceptar:
 * - `accepted`: quedó apuntada la versión vigente.
 * - `not_recorded`: el servidor contestó bien pero no la apuntó. Pasa si el
 *   servidor es más antiguo que la App y todavía no conoce esta versión
 *   (solo cuenta la que él tiene por vigente). No es culpa de la persona:
 *   se la deja pasar y el servidor volverá a preguntar cuando la conozca.
 * - `failed`: no se pudo guardar (sin red, error): se puede reintentar.
 */
export type AcceptTermsResult = 'accepted' | 'not_recorded' | 'failed'

/** «Continuar»: deja apuntada la versión aceptada. */
export const acceptTerms = async (): Promise<AcceptTermsResult> => {
  try {
    const user = await apiFetch('/users/me', {
      method: 'PATCH',
      auth: true,
      body: { terms_version: TERMS_VERSION },
      schema: userSchema,
    })
    return needsTerms(user.terms_version) ? 'not_recorded' : 'accepted'
  } catch {
    return 'failed'
  }
}
