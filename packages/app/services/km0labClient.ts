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
 *   POST /auth/verify-otp    { email, code }        -> { access_token, user }
 *   GET  /users/me                                   -> UserOut  (Bearer)
 *   PATCH /users/me          { name?, lang?, ... }   -> UserOut  (Bearer)
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

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  lang: z.string(),
  postal_code: z.string().nullable(),
  town: z.string().nullable(),
  points: z.number(),
  created_at: z.string(),
})
export type ApiUser = z.infer<typeof userSchema>

export const authSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: userSchema,
})

export const messageSchema = z.object({ message: z.string() })

type FetchOpts<T> = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  schema?: z.ZodType<T>
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
