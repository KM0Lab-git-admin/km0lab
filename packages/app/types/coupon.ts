/**
 * Coupon — cupón/promo individual para la sección "Promos para ti".
 *
 * Visual de tarjeta horizontal: icono (% / regalo) + título + validez
 * + chevron. Sin imagen externa, todo se resuelve con tokens KM0.
 */
export interface Coupon {
  id: string
  /** Texto principal (ej.: "10% dto. en comercios locales"). */
  title: string
  /** Validez legible (ej.: "Válido hasta el 30/06/2026"). */
  validity: string
  /** Tipo visual del icono: porcentaje (default), regalo o ticket. */
  kind?: 'percent' | 'gift' | 'ticket'
  /** Coste en puntos para bescanviar (spec Home "Missió del barri"). */
  costPoints?: number
  /** Si es true, el cupón se muestra bloqueado (invitado o sin puntos suficientes). */
  locked?: boolean
  /** Valor del descuento/recompensa mostrado en el icono (ej.: "-20%", "5€"). */
  value?: string
}
