import { env } from './env'
import { t } from './i18n'

import type { Lang } from './i18n'
import type { RewardOut } from '../services/km0labClient'
import type {
  Reward,
  RewardCategory,
  RewardKind,
  RewardStatus,
} from '../types/reward'

/** API type → RewardKind para el fallback de icono. */
export const TYPE_TO_KIND: Record<string, RewardKind> = {
  balance: 'voucher',
  experience: 'ticket',
  product: 'product',
  merchandise: 'product',
  service: 'product',
  discount: 'discount',
}

/** API type → RewardCategory. */
const TYPE_TO_CATEGORY: Record<string, RewardCategory> = {
  discount: 'discount',
  balance: 'balance',
  product: 'merchandising',
  merchandise: 'merchandising',
  service: 'merchandising',
  experience: 'experience',
}

/**
 * Convierte una ruta relativa de media (`/api/v1/rewards/{id}/media`)
 * en URL absoluta usando el origen de la API.
 */
export function resolveMediaUrl(
  path: string | null | undefined
): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const base = env.km0labApiUrl.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/** Mapea RewardOut de API a Reward de UI. */
export function toReward(out: RewardOut, lang: Lang): Reward {
  const shopCount = out.shop_ids?.length ?? 0
  const scope =
    shopCount === 0
      ? t('rewards.scope.all', lang)
      : t('rewards.scope.shops', lang).replace('{n}', String(shopCount))

  const status = (
    ['active', 'sold_out', 'inactive'].includes(out.status)
      ? out.status
      : 'active'
  ) as RewardStatus

  return {
    id: out.id,
    title: out.name,
    description: out.description,
    category: TYPE_TO_CATEGORY[out.type] ?? 'merchandising',
    status,
    kind: TYPE_TO_KIND[out.type] ?? 'product',
    costPoints: out.points_required,
    valueLabel: out.value ?? '',
    stock: out.stock ?? null,
    scope,
    hasImage: out.has_image,
    imageUrl: out.has_image ? resolveMediaUrl(out.image_url) : null,
  }
}
