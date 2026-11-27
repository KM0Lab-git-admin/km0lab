/**
 * apiClient — acceso HTTP a la API de events-query (eventquery.uat.km0lab.com).
 *
 * Base URL desde `VITE_EVENTS_API_URL`. En producción la app llama directa a
 * events-query (su CORS ya admite los dominios de la app); no se usa el proxy
 * Supabase que Lovable necesitaba para saltarse CORS desde *.lovable.app.
 *
 * Toda respuesta se valida con zod en los services (apiSchemas.ts): un cambio
 * de shape en el scraper produce `ApiContractError` explícito, nunca una UI
 * rota en silencio.
 */
import { env } from '../utils/env'

import type { z } from 'zod'

const BASE_URL = env.eventsApiUrl.replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiContractError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly issues: z.ZodIssue[]
  ) {
    super(
      `La respuesta de ${endpoint} no cumple el contrato: ${issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`
    )
    this.name = 'ApiContractError'
  }
}

export async function apiFetch<T>(
  path: string,
  // Input desacoplado del output: los schemas con `.default()` tienen tipo de
  // entrada (campo opcional) distinto del de salida (campo requerido).
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new ApiError(res.status, `API ${path} respondió ${res.status}`)
  }
  const json: unknown = await res.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    throw new ApiContractError(path, parsed.error.issues)
  }
  return parsed.data
}
