import type { PointsTransaction } from '@km0lab/app'

/**
 * Historial mock de movimientos de puntos.
 * Refleja las acciones reales configuradas en el panel de puntos.
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
    type: 'scan',
    conceptKey: 'points.history.type.scan',
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
    type: 'web_visit',
    conceptKey: 'points.history.type.web_visit',
    place: 'Turisme Malgrat',
    date: iso(1, 18, 5),
    points: 15,
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
    type: 'scan',
    conceptKey: 'points.history.type.scan',
    place: 'Cafè del Mar',
    date: iso(3, 17, 30),
    points: 20,
  },
  {
    id: 'tx-06',
    type: 'event_signup',
    conceptKey: 'points.history.type.event_signup',
    place: 'Festa Major',
    date: iso(5, 10, 0),
    points: 75,
  },
  {
    id: 'tx-07',
    type: 'scan',
    conceptKey: 'points.history.type.scan',
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
    type: 'survey',
    conceptKey: 'points.history.type.survey',
    place: 'Enquesta KM0 LAB',
    date: iso(12, 11, 45),
    points: 30,
  },
  {
    id: 'tx-10',
    type: 'scan',
    conceptKey: 'points.history.type.scan',
    place: 'Cal Sastre',
    date: iso(18, 16, 10),
    points: 20,
  },
  {
    id: 'tx-11',
    type: 'web_visit',
    conceptKey: 'points.history.type.web_visit',
    place: 'Ajuntament de Malgrat',
    date: iso(25, 10, 30),
    points: 15,
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
    type: 'suggestion',
    conceptKey: 'points.history.type.suggestion',
    place: 'Suggeriment enviat',
    date: iso(48, 12, 0),
    points: 25,
  },
  {
    id: 'tx-14',
    type: 'signup',
    conceptKey: 'points.history.type.signup',
    date: iso(60, 9, 0),
    points: 100,
  },
]
