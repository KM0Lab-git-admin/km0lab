import type { RewardCategory, RewardKind } from '../types/reward'
import type { Lang } from '../utils/i18nProd'

/**
 * Redemption — registro de un premio canjeado por un usuario.
 *
 * A diferencia de `Reward` (catálogo), esta entidad representa una instancia
 * concreta de canje: código, fecha, comercio y estado de la entrega/validación.
 */
export type RedemptionStatus =
  | 'pending' // Back-office aún no confirma el lliurament
  | 'ready' // Llest per recollir / validar al comerç
  | 'redeemed' // Ja validat o consumit
  | 'expired' // Codi no utilitzat dins del termini

export interface Redemption {
  translations?: Partial<Record<Lang, { title: string; description: string }>>
  id: string
  rewardId: string
  rewardTitle: string
  rewardDescription: string
  rewardCategory: RewardCategory
  rewardKind: RewardKind
  /** Imagen del premio (misma URL pública que el catálogo UAT); si falta, se muestra el icono del tipo. */
  imageUrl?: string | null
  hasImage?: boolean
  isMock?: boolean
  costPoints: number
  valueLabel: string
  status: RedemptionStatus
  /** Codi de 5 dígits que el comerç valida al back-office. */
  code: string | null
  /** Nom del comerç o punt de recollida. */
  shopName?: string
  /** Data en què l'usuari va sol·licitar el bescanvi. */
  redeemedAt: string
  /** Data límit per utilitzar el codi (null = sense caducitat). */
  expiresAt?: string
  /** Data en què es va completar la validació/lliurament. */
  completedAt?: string
}

export function isPendingRedemption(redemption: Redemption): boolean {
  return redemption.status === 'pending' || redemption.status === 'ready'
}
