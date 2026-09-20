/**
 * rewardsApi — consumo de la API real de premios.
 *
 * Solo LECTURA: GET /api/v1/rewards/public?postal_code=&lang=. Las
 * pantallas consumen estas funciones vía React Query; nunca hacen fetch
 * directamente. Las imágenes relativas se absolutizan al host de la API.
 *
 * NOTA: no usa `apiClient.ts` (contrato intocable de events-query);
 * replica su patrón de validación zod con base propia.
 */
import { z } from 'zod'

const BASE_URL = (import.meta.env.VITE_KM0LAB_API_URL ?? '').replace(/\/+$/, '')

/** Host público de la API: para absolutizar imágenes servidas por ella. */
const REWARDS_HOST = BASE_URL || 'https://api.uat.km0lab.com'

export class RewardsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'RewardsApiError'
  }
}

export class RewardsApiContractError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly issues: z.ZodIssue[]
  ) {
    super(
      `La respuesta de ${endpoint} no cumple el contrato: ${issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`
    )
    this.name = 'RewardsApiContractError'
  }
}

const i18nMapSchema = z.record(z.string(), z.string()).nullable().optional()

const publicRewardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  name_i18n: i18nMapSchema,
  description_i18n: i18nMapSchema,
  image_url: z.string().nullable().optional(),
  has_image: z.boolean().optional(),
  type: z.enum(['balance', 'discount', 'experience', 'merchandise', 'product']),
  points_required: z.number(),
  value: z.string().nullable().optional(),
  stock: z.number().nullable().optional(),
  status: z.string(),
})

export const publicRewardsResponseSchema = z.array(publicRewardSchema)
export type PublicReward = z.infer<typeof publicRewardSchema>

/** Premio adaptado para la UI (Home preview, catálogo). */
export interface ApiReward {
  id: string
  title: string
  description: string
  kind: 'voucher' | 'ticket' | 'product' | 'discount'
  costPoints: number
  valueLabel: string
  stock: number | null
  /** URL absoluta de la imagen; null si el premio no tiene. */
  imageUrl: string | null
}

const KIND_BY_TYPE: Record<PublicReward['type'], ApiReward['kind']> = {
  balance: 'voucher',
  experience: 'ticket',
  merchandise: 'product',
  product: 'product',
  discount: 'discount',
}

function pickI18n(
  base: string,
  i18n: Record<string, string> | null | undefined,
  lang: string
): string {
  return i18n?.[lang] ?? i18n?.ca ?? i18n?.es ?? i18n?.en ?? base
}

function toAbsolute(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${REWARDS_HOST}${url}`
}

function adaptReward(raw: PublicReward, lang: string): ApiReward {
  return {
    id: raw.id,
    title: pickI18n(raw.name, raw.name_i18n, lang),
    description: pickI18n(raw.description ?? '', raw.description_i18n, lang),
    kind: KIND_BY_TYPE[raw.type],
    costPoints: raw.points_required,
    valueLabel: raw.value ?? '',
    stock: raw.stock ?? null,
    imageUrl: toAbsolute(raw.image_url),
  }
}

export interface ListPublicRewardsParams {
  postalCode?: string
  lang?: 'ca' | 'es' | 'en'
}

/**
 * Premios públicos activos. Si se pasa `postalCode`, la API acota el
 * listado a ese municipio; sin él devuelve todos los premios activos.
 */
export async function listPublicRewards(
  params: ListPublicRewardsParams = {}
): Promise<ApiReward[]> {
  const search = new URLSearchParams()
  if (params.postalCode) search.set('postal_code', params.postalCode)
  if (params.lang) search.set('lang', params.lang)
  const qs = search.toString()
  const path = `/api/v1/rewards/public${qs ? `?${qs}` : ''}`

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new RewardsApiError(res.status, `API ${path} respondió ${res.status}`)
  }
  const json: unknown = await res.json()
  const parsed = publicRewardsResponseSchema.safeParse(json)
  if (!parsed.success) {
    throw new RewardsApiContractError(path, parsed.error.issues)
  }

  const lang = params.lang ?? 'ca'
  return parsed.data
    .filter((r) => r.status === 'active')
    .map((r) => adaptReward(r, lang))
}
