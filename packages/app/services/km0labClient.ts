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
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
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
  }
  return `HTTP ${status}`
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
    throw new ApiError(res.status, errorMessage(json, res.status))
  }

  return schema ? schema.parse(json) : (json as T)
}
