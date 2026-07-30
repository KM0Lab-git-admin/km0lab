/**
 * km0labClient — cliente HTTP del backend de la app (km0lab-api).
 *
 * Base URL desde `VITE_KM0LAB_API_URL` (ver utils/env). Todas las llamadas
 * cuelgan de `/api/v1`. Adjunta el JWT (Bearer) del store cuando `auth: true`
 * y valida la respuesta con zod: un cambio de shape en el backend produce un
 * error explícito, nunca una UI rota en silencio.
 *
 * Contrato (docs/BACKEND.md §4): auth OTP por email + JWT.
 *   POST /auth/request-otp   { email }              -> { message }
 *   POST /auth/verify-otp    { email, code }        -> { access_token, user, points_awarded? }
 *   GET  /users/me                                   -> UserOut  (Bearer)
 *   PATCH /users/me          { first_name?, … }      -> UserOut  (Bearer)
 *   POST /points/claim-birthday                      -> ClaimPointsOut (Bearer)
 */
import { z } from 'zod'

import { useAppStore } from '../stores/useAppStore'
import { env } from '../utils/env'

const BASE_URL = `${env.km0labApiUrl.replace(/\/$/, '')}/api/v1`

export class ApiError extends Error {
  /** Cuerpo `detail` crudo de FastAPI (string, array u objeto). */
  readonly detail: unknown
  constructor(
    public readonly status: number,
    message: string,
    detail: unknown = undefined
  ) {
    super(message)
    this.name = 'ApiError'
    this.detail = detail
  }
}

const userSchemaRaw = z.object({
  id: z.string(),
  email: z.string(),
  slug: z.string().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  lang: z.string(),
  postal_code: z.string().nullable(),
  town_id: z.string().nullable().optional(),
  town_name: z.string().nullable().optional(),
  /** Legacy alias some clients still expect. */
  town: z.string().nullable().optional(),
  points: z.number(),
  roles: z.array(z.string()).optional(),
  shop_id: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  contact_shared: z.boolean().optional(),
  is_fake: z.boolean().optional(),
  created_at: z.string(),
})

export const userSchema = userSchemaRaw.transform((u) => {
  const joined = [u.first_name, u.last_name].filter(Boolean).join(' ')
  const display = u.name ?? (joined || null)
  const town = u.town_name ?? u.town ?? null
  return {
    ...u,
    name: display,
    town,
    first_name: u.first_name ?? null,
    last_name: u.last_name ?? null,
    phone: u.phone ?? null,
    birth_date: u.birth_date ?? null,
  }
})
export type ApiUser = z.infer<typeof userSchema>

export const authSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: userSchema,
  points_awarded: z.number().nullable().optional(),
  points_award_message: z.string().nullable().optional(),
})

export const messageSchema = z.object({ message: z.string() })

export const claimPointsSchema = z.object({
  awarded: z.boolean(),
  points: z.number(),
  balance: z.number(),
  message: z.string().nullable().optional(),
})
export type ClaimPoints = z.infer<typeof claimPointsSchema>

export const pointsHistoryItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  points: z.number(),
  description: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  shop_name: z.string().nullable().optional(),
  reward_name: z.string().nullable().optional(),
  ref_id: z.string().nullable().optional(),
  created_at: z.string(),
})
export type PointsHistoryItemOut = z.infer<typeof pointsHistoryItemSchema>

export const pointsHistoryOutSchema = z.object({
  balance: z.number(),
  earned_total: z.number(),
  spent_total: z.number(),
  items: z.array(pointsHistoryItemSchema).default([]),
})
export type PointsHistoryOut = z.infer<typeof pointsHistoryOutSchema>

export const pointActionOutSchema = z.object({
  id: z.string(),
  town_id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  points: z.number(),
  visible_home: z.boolean().default(true),
  active: z.boolean(),
  url: z.string().nullable().optional(),
  event_id: z.string().nullable().optional(),
  cooldown_days: z.number().nullable().optional(),
})
export type PointActionOut = z.infer<typeof pointActionOutSchema>

export const rewardOutSchema = z.object({
  id: z.string(),
  town_id: z.string(),
  name: z.string(),
  description: z.string(),
  image_url: z.string().nullable().optional(),
  has_image: z.boolean().default(false),
  type: z.string(),
  points_required: z.number(),
  value: z.string().nullable().optional(),
  stock: z.number().nullable().optional(),
  conditions: z.string().nullable().optional(),
  status: z.string(),
  shop_ids: z.array(z.string()).default([]),
})
export type RewardOut = z.infer<typeof rewardOutSchema>

export const promotionOutSchema = z.object({
  id: z.string(),
  shop_id: z.string(),
  type: z.string(),
  label: z.string(),
  title: z.string(),
  detail: z.string(),
  conditions: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  active: z.boolean().default(true),
})
export type PromotionOut = z.infer<typeof promotionOutSchema>

export const dayHoursSchema = z.object({
  closed: z.boolean().default(true),
  opens: z.string().nullable().optional(),
  closes: z.string().nullable().optional(),
  opens_2: z.string().nullable().optional(),
  closes_2: z.string().nullable().optional(),
})

export const shopOutSchema = z.object({
  id: z.string(),
  town_id: z.string().optional(),
  town_name: z.string().nullable().optional(),
  name: z.string(),
  emoji: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  has_logo: z.boolean().default(false),
  has_hero: z.boolean().optional().default(false),
  hero_url: z.string().nullable().optional(),
  categories: z.array(z.string()).default([]),
  address: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  visit_points: z.number().optional(),
  qr_code: z.string().nullable().optional(),
  opening_hours: z
    .object({
      monday: dayHoursSchema.default({}),
      tuesday: dayHoursSchema.default({}),
      wednesday: dayHoursSchema.default({}),
      thursday: dayHoursSchema.default({}),
      friday: dayHoursSchema.default({}),
      saturday: dayHoursSchema.default({}),
      sunday: dayHoursSchema.default({}),
    })
    .nullable()
    .optional(),
})
export type ShopOut = z.infer<typeof shopOutSchema>
export type DayHoursOut = z.infer<typeof dayHoursSchema>
export type OpeningHoursOut = NonNullable<ShopOut['opening_hours']>

/** GET /shops/for-me — shop del residente con estado de escaneo del usuario. */
export const shopResidentOutSchema = shopOutSchema.extend({
  scanned: z.boolean().default(false),
  scan_available: z.boolean().default(true),
  available_at: z.string().nullable().optional(),
  last_scanned_at: z.string().nullable().optional(),
})
export type ShopResidentOut = z.infer<typeof shopResidentOutSchema>

/** GET /towns/public — reglas públicas del municipio (puntos QR, etc.). */
export const townPublicOutSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo_url: z.string().nullable().optional(),
  has_logo: z.boolean().default(false),
  points_per_euro: z.number().default(200),
  default_visit_points: z.number().default(10),
  default_lang: z.string().default('ca'),
  expiry_months: z.number().nullable().optional(),
})
export type TownPublicOut = z.infer<typeof townPublicOutSchema>

/** POST /scans — resultado de escanear el QR de un comercio. */
export const scanOutSchema = z.object({
  id: z.string(),
  shop_id: z.string(),
  shop_name: z.string().nullable().optional(),
  points: z.number(),
  created_at: z.string(),
  balance: z.number(),
  available_at: z.string().nullable().optional(),
})
export type ScanOut = z.infer<typeof scanOutSchema>

export const redemptionEventOutSchema = z.object({
  status: z.string(),
  note: z.string().nullable().optional(),
  created_at: z.string(),
})
export type RedemptionEventOut = z.infer<typeof redemptionEventOutSchema>

export const redemptionOutSchema = z.object({
  id: z.string(),
  town_id: z.string(),
  user_id: z.string(),
  reward_id: z.string(),
  flow: z.string(),
  points_spent: z.number(),
  status: z.string(),
  code: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  shop_id: z.string().nullable().optional(),
  used_at: z.string().nullable().optional(),
  amount_applied: z.string().nullable().optional(),
  payment_id: z.string().nullable().optional(),
  delivered_at: z.string().nullable().optional(),
  requested_at: z.string(),
  is_fake: z.boolean().default(false),
  events: z.array(redemptionEventOutSchema).default([]),
})
export type RedemptionOut = z.infer<typeof redemptionOutSchema>

type FetchOpts<T> = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>
  auth?: boolean
}

/** Extrae un mensaje legible del cuerpo de error de FastAPI ({ detail }). */
function errorMessage(json: unknown, status: number): string {
  if (json && typeof json === 'object' && 'detail' in json) {
    const detail = (json as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object') {
      const msg = (detail[0] as { msg?: unknown }).msg
      if (typeof msg === 'string') return msg
    }
    if (detail && typeof detail === 'object') {
      const code = (detail as { code?: unknown }).code
      if (typeof code === 'string') return code
    }
  }
  return `HTTP ${status}`
}

function detailOf(json: unknown): unknown {
  if (json && typeof json === 'object' && 'detail' in json) {
    return (json as { detail: unknown }).detail
  }
  return undefined
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, schema, auth = false }: FetchOpts<T> = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (auth) {
    const token = useAppStore.getState().token
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  const json: unknown = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new ApiError(
      res.status,
      errorMessage(json, res.status),
      detailOf(json)
    )
  }

  return schema ? schema.parse(json) : (json as T)
}
