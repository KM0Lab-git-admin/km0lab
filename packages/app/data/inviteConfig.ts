import { getShareLink } from '../utils/shareUrl'

export const INVITE_REWARDS = {
  person: 100,
  business: 500,
} as const

export type InviteKind = keyof typeof INVITE_REWARDS

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

interface InviteLinkOptions {
  kind: InviteKind
  reference: string
  town?: string | null
  lang?: string | null
}

export const buildInviteLink = ({
  kind,
  reference,
  town,
  lang,
}: InviteLinkOptions): string =>
  getShareLink(kind === 'person' ? '/home' : '/business-signup', {
    invite: kind,
    ref: reference,
    town,
    lang,
  })

export const buildPublicShareLink = (
  town?: string | null,
  lang?: string | null
): string => getShareLink('/home', { town, lang })
