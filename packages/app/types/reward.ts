/**
 * Reward — premio del catálogo canjeable por puntos.
 *
 * Los premios los define el back-office. Cada uno pertenece a una categoría
 * (Saldo, Experiència, Merchandising, Descompte), tiene un coste en puntos
 * y puede estar `active`, `sold_out` o `inactive`.
 */
export type RewardCategory =
  | 'balance'
  | 'experience'
  | 'merchandising'
  | 'discount'
export type RewardStatus = 'active' | 'sold_out' | 'inactive'
export type RewardKind = 'voucher' | 'ticket' | 'product' | 'discount'

export interface Reward {
  id: string
  title: string
  description: string
  category: RewardCategory
  status: RewardStatus
  kind: RewardKind
  costPoints: number
  /** Valor legible (ej. "5 €", "1 unitat", "10%"). */
  valueLabel: string
  /** null = ilimitado. */
  stock: number | null
  /** Texto del alcance ("Tots els comerços adherits", "1 comerç"). */
  scope: string
}
