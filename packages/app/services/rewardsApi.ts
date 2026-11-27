/**
 * rewardsApi — forma del premio que pintan Home y el catálogo.
 *
 * En Lovable este fichero pide los premios a través de su propio
 * intermediario. En producción los premios se piden con el cliente común
 * (`services/rewards.ts` → `GET /rewards/public`) y se adaptan con
 * `rewardMapper`; aquí solo queda el tipo que comparten las pantallas.
 */
import type { RewardCategory, RewardKind, RewardStatus } from '../types/reward'
import type { Lang } from '../utils/i18n'

export interface ApiReward {
  translations?: Partial<Record<Lang, { title: string; description: string }>>
  category: RewardCategory
  status: RewardStatus
  scope: string
  id: string
  title: string
  description: string
  kind: RewardKind
  costPoints: number
  valueLabel: string
  stock: number | null
  /** URL absoluta de la imagen; null si el premio no tiene. */
  imageUrl: string | null
  hasImage?: boolean
}
