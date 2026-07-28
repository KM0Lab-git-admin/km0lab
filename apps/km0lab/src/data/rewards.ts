import type { Reward } from '@km0lab/app'

/**
 * Catálogo mock de premios canjeables por puntos.
 * Reproduce el listado definido en el back-office del programa.
 */
export const REWARDS: Reward[] = [
  {
    id: 'val-5eur',
    title: 'Val de 5€',
    description: 'Val bescanviable a qualsevol comerç adherit de la població.',
    category: 'balance',
    status: 'active',
    kind: 'voucher',
    costPoints: 1000,
    valueLabel: '5 €',
    stock: null,
    scope: 'Tots els comerços adherits',
  },
  {
    id: 'val-10eur',
    title: 'Val de 10€',
    description: 'Val bescanviable a qualsevol comerç adherit de la població.',
    category: 'balance',
    status: 'active',
    kind: 'voucher',
    costPoints: 2000,
    valueLabel: '10 €',
    stock: null,
    scope: 'Tots els comerços adherits',
  },
  {
    id: 'entrada-cinema',
    title: 'Entrada de cinema',
    description: 'Una entrada per a qualsevol sessió no premium.',
    category: 'experience',
    status: 'active',
    kind: 'ticket',
    costPoints: 1500,
    valueLabel: '1 entrada',
    stock: 20,
    scope: '1 comerç',
  },
  {
    id: 'gorra-km0',
    title: 'Gorra KM0 LAB',
    description: 'Gorra oficial del programa KM0 LAB.',
    category: 'merchandising',
    status: 'active',
    kind: 'product',
    costPoints: 600,
    valueLabel: '1 unitat',
    stock: 45,
    scope: 'Tots els comerços adherits',
  },
  {
    id: 'samarreta-km0',
    title: 'Samarreta KM0 LAB',
    description: 'Samarreta oficial del programa KM0 LAB.',
    category: 'merchandising',
    status: 'sold_out',
    kind: 'product',
    costPoints: 800,
    valueLabel: '1 unitat',
    stock: 0,
    scope: 'Tots els comerços adherits',
  },
]
