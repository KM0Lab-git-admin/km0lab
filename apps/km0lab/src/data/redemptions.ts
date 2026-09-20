import type { Redemption } from '@km0lab/app'

/**
 * Una sola mostra de UI per localhost. No s'envia a UAT/producció.
 */
export const LOCALHOST_REDEMPTION_MOCK: Redemption = {
  id: 'mock-rdm-localhost',
  rewardId: 'mock-val-20eur',
  rewardTitle: 'Val de 20€',
  rewardDescription:
    'Val de descompte bescanviable a qualsevol comerç adherit.',
  rewardCategory: 'balance',
  rewardKind: 'voucher',
  costPoints: 4000,
  valueLabel: '20 €',
  status: 'ready',
  code: '38421',
  shopName: 'Forn Rovira',
  redeemedAt: '2026-07-25T10:30:00Z',
  expiresAt: '2026-08-25T23:59:59Z',
  isMock: true,
}
