import { getShareLink } from '@km0lab/app'

/** Pilot example: points per rewarded friend and default rewarded-friend limit. */
export const INVITE_REWARDS = {
  person: 50,
  friendLimit: 3,
} as const

/**
 * Referencia de invitación asociada al usuario identificado.
 *
 * Es determinista y opaca: no contiene datos personales ni el id en claro,
 * de modo que el mismo usuario genera siempre el mismo código.
 *
 * PENDIENTE DE BACKEND: el código definitivo debe emitirlo y resolverlo el
 * backend (tabla de referidos) para poder atribuir el registro y conceder
 * los puntos. Mientras no exista, esta función solo prepara el frontend.
 */
export const getReferralReferenceForUser = (userId: string): string => {
  let hash = 0x811c9dc5
  for (let index = 0; index < userId.length; index += 1) {
    hash ^= userId.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return `km0-${hash.toString(36)}${userId.length.toString(36)}`
}

export const buildPublicShareLink = (
  town?: string | null,
  lang?: string | null
): string => {
  return getShareLink('/home', {
    town: town || undefined,
    lang: lang || undefined,
  })
}
