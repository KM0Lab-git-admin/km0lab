import type { PointsTransaction } from '@km0lab/app'

/**
 * Historial mock de movimientos de puntos.
 * Ordenado por fecha descendente. Los totales de la pantalla
 * (saldo, guanyats, gastats) se derivan de esta lista.
 */
const now = new Date()
const iso = (daysAgo: number, hour = 10, minute = 0): string => {
  const d = new Date(now)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const POINTS_HISTORY: PointsTransaction[] = [
  {
    id: 'tx-01',
    type: 'visit',
    conceptKey: 'points.history.type.visit',
    place: 'Forn Rovira',
    date: iso(0, 9, 15),
    points: 20,
  },
  {
    id: 'tx-02',
    type: 'redeem',
    conceptKey: 'points.history.type.redeem',
    place: 'Val 5€ · Cafè del Mar',
    date: iso(0, 8, 40),
    points: -200,
  },
  {
    id: 'tx-03',
    type: 'purchase',
    conceptKey: 'points.history.type.purchase',
    place: 'Cal Sastre',
    date: iso(1, 18, 5),
    points: 40,
  },
  {
    id: 'tx-04',
    type: 'first_scan',
    conceptKey: 'points.history.type.first_scan',
    place: 'Floristeria Nom',
    date: iso(2, 12, 10),
    points: 50,
  },
  {
    id: 'tx-05',
    type: 'visit',
    conceptKey: 'points.history.type.visit',
    place: 'Cafè del Mar',
    date: iso(3, 17, 30),
    points: 20,
  },
  {
    id: 'tx-06',
    type: 'campaign',
    conceptKey: 'points.history.type.campaign',
    place: 'Aniversari KM0',
    date: iso(5, 10, 0),
    points: 75,
  },
  {
    id: 'tx-07',
    type: 'visit',
    conceptKey: 'points.history.type.visit',
    place: 'Forn Rovira',
    date: iso(6, 9, 20),
    points: 20,
  },
  {
    id: 'tx-08',
    type: 'redeem',
    conceptKey: 'points.history.type.redeem',
    place: 'Entrada cinema · Casal',
    date: iso(9, 20, 0),
    points: -150,
  },
  {
    id: 'tx-09',
    type: 'purchase',
    conceptKey: 'points.history.type.purchase',
    place: 'Floristeria Nom',
    date: iso(12, 11, 45),
    points: 60,
  },
  {
    id: 'tx-10',
    type: 'visit',
    conceptKey: 'points.history.type.visit',
    place: 'Cal Sastre',
    date: iso(18, 16, 10),
    points: 20,
  },
  {
    id: 'tx-11',
    type: 'first_scan',
    conceptKey: 'points.history.type.first_scan',
    place: 'Cafè del Mar',
    date: iso(25, 10, 30),
    points: 50,
  },
  {
    id: 'tx-12',
    type: 'redeem',
    conceptKey: 'points.history.type.redeem',
    place: 'Descompte 10% · Forn Rovira',
    date: iso(34, 19, 0),
    points: -80,
  },
  {
    id: 'tx-13',
    type: 'campaign',
    conceptKey: 'points.history.type.campaign',
    place: 'Sant Jordi',
    date: iso(48, 12, 0),
    points: 100,
  },
  {
    id: 'tx-14',
    type: 'signup',
    conceptKey: 'points.history.type.signup',
    date: iso(60, 9, 0),
    points: 100,
  },
]
