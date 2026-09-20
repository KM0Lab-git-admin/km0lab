import { z } from 'zod'

import { apiFetch, ApiError } from './km0labClient'
import type {
  InvitationKind,
  InvitationRecord,
  InvitationStatus,
  InvitationsSummary,
} from '../types/invitation'

export const inviteLinkSchema = z.object({
  public_code: z.string(),
  kind: z.enum(['person', 'business']),
  town_id: z.string(),
})

export const inviteResolveSchema = z.object({
  valid: z.boolean(),
  code: z.string().nullable().optional(),
  kind: z.enum(['person', 'business']).nullable().optional(),
  town_id: z.string().nullable().optional(),
  town_name: z.string().nullable().optional(),
})

export const inviteSummarySchema = z.object({
  persons_registered: z.number(),
  businesses_registered: z.number(),
  points_earned: z.number(),
  points_pending: z.number(),
})

const inviteConversionSchema = z.object({
  id: z.string(),
  kind: z.enum(['person', 'business']),
  status: z.enum(['started', 'pending', 'granted', 'pending_reward', 'failed']),
  display_name: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  granted_at: z.string().nullable().optional(),
  points: z.number(),
})

export const inviteConversionListSchema = z.object({
  items: z.array(inviteConversionSchema),
  total: z.number(),
})

export const shopPublicSignupSchema = z.object({
  shop_id: z.string(),
  status: z.string(),
  contact_email: z.string(),
  needs_otp: z.boolean(),
  message: z.string(),
})

const toUiStatus = (status: string): InvitationStatus => {
  if (status === 'granted') return 'granted'
  if (status === 'started') return 'started'
  return 'pending'
}

const toRecord = (
  row: z.infer<typeof inviteConversionSchema>
): InvitationRecord => ({
  id: row.id,
  kind: row.kind,
  status: toUiStatus(row.status),
  displayName: row.display_name ?? null,
  startedAt: null,
  completedAt: row.completed_at ?? null,
  grantedAt: row.granted_at ?? null,
  points: row.points,
})

export const getMyInviteLink = (kind: InvitationKind) =>
  apiFetch(`/invites/me/link?kind=${kind}`, {
    auth: true,
    schema: inviteLinkSchema,
  })

export const getMyInviteSummary = async (): Promise<InvitationsSummary> => {
  const raw = await apiFetch('/invites/me/summary', {
    auth: true,
    schema: inviteSummarySchema,
  })
  return {
    personsRegistered: raw.persons_registered,
    businessesRegistered: raw.businesses_registered,
    pointsEarned: raw.points_earned,
    pointsPending: raw.points_pending,
  }
}

export const listMyConversions = async (
  kind?: InvitationKind
): Promise<InvitationRecord[]> => {
  const qs = kind ? `?kind=${kind}` : ''
  const raw = await apiFetch(`/invites/me/conversions${qs}`, {
    auth: true,
    schema: inviteConversionListSchema,
  })
  return raw.items.map(toRecord)
}

export const resolveInviteCode = (code: string) =>
  apiFetch('/invites/resolve', {
    method: 'POST',
    body: { code },
    schema: inviteResolveSchema,
  })

export const trackInviteEvent = async (payload: {
  type:
    | 'share_initiated'
    | 'link_resolved'
    | 'registration_started'
    | 'install_referrer_recovered'
  code?: string | null
  channel?: 'whatsapp' | 'email' | 'facebook' | 'copy' | 'other' | null
}): Promise<void> => {
  try {
    await apiFetch('/invites/events', {
      method: 'POST',
      body: payload,
      schema: z.object({ message: z.string() }),
    })
  } catch {
    /* telemetry must not block share */
  }
}

export const publicShopSignup = async (input: {
  name: string
  taxId: string
  categories?: string[]
  contactEmail: string
  postalCode: string
  address?: string
  phone?: string
  website?: string
  description?: string
  inviteCode?: string | null
}): Promise<
  | { status: 'created'; businessId: string; needsOtp: boolean }
  | { status: 'already_registered' }
> => {
  try {
    const out = await apiFetch('/shops/public-signup', {
      method: 'POST',
      auth: true,
      body: {
        name: input.name,
        tax_id: input.taxId,
        categories: input.categories ?? [],
        contact_email: input.contactEmail,
        postal_code: input.postalCode,
        address: input.address,
        phone: input.phone,
        website: input.website || undefined,
        description: input.description,
        invite_code: input.inviteCode || undefined,
      },
      schema: shopPublicSignupSchema,
    })
    return {
      status: 'created',
      businessId: out.shop_id,
      needsOtp: out.needs_otp,
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      return { status: 'already_registered' }
    }
    throw e
  }
}
