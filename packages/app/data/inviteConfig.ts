import { getCanonicalWebLink, getShareLink } from '../utils/shareUrl'

export const INVITE_REWARDS = {
  person: 100,
  business: 500,
} as const

export type InviteKind = keyof typeof INVITE_REWARDS

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
  getCanonicalWebLink(`/i/${reference}`, { town, lang, invite: kind })

export const buildPublicShareLink = (
  town?: string | null,
  lang?: string | null
): string => getShareLink('/home', { town, lang })
