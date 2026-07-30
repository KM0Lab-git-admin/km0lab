import type { RewardCategory, RewardKind } from './reward'

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
  id: string
  rewardId: string
  rewardTitle: string
  rewardDescription: string
  rewardCategory: RewardCategory
  rewardKind: RewardKind
  costPoints: number
  valueLabel: string
  status: RedemptionStatus
  /** Codi de 5 dígits (voucher_qr). Null en flux delivery. */
  code: string | null
  /** Nom del comerç o punt de recollida. */
  shopName?: string
  /** Data en què l'usuari va sol·licitar el bescanvi. */
  redeemedAt: string
  /** Data límit per utilitzar el codi (null = sense caducitat). */
  expiresAt?: string
  /** Data en què es va completar la validació/lliurament. */
  completedAt?: string
  /** Imatge del premi (join amb catàleg). */
  imageUrl?: string | null
  hasImage?: boolean
}
