import type { Coupon } from '@km0lab/app'

/**
 * Cupones mock para la sección "Bescanvia amb punts" del Home.
 * Muestran recompensas reales (descuentos %, euros, regalos) que se
 * desbloquean registrándose o canjeando puntos.
 */
export const REDEEM_COUPONS: Coupon[] = [
  {
    id: 'forn-rovira-20pct',
    title: 'Forn Rovira',
    validity: 'Descompte en productes de forn',
    kind: 'percent',
    costPoints: 400,
    value: '-20%',
  },
  {
    id: 'floristeria-maria-5eur',
    title: 'Floristeria Maria',
    validity: 'Descompte en rams i plantes',
    kind: 'gift',
    costPoints: 600,
    value: '-5€',
  },
  {
    id: 'llibreria-pages-10pct',
    title: 'Llibres i Més',
    validity: 'Vàlid en llibres de tota la botiga',
    kind: 'percent',
    costPoints: 350,
    value: '-10%',
  },
]
