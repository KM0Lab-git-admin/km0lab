/**
 * El código de escaneo de un comercio ya no llega a la app en los
 * listados (quien lo leía podía sumar la visita sin ir). La tarjeta sigue
 * sabiendo si el comercio tiene QR.
 */
import { describe, expect, it } from 'vitest'

import { shopOutSchema } from '../services/km0labClient'
import { toComercAdherit } from '../utils/shopMapper'

const base = {
  id: 'shop-1',
  town_id: 'town-1',
  name: 'Forn de prova',
  emoji: null,
  logo_url: null,
  categories: ['fleca'],
  status: 'active',
}

describe('tarjeta de comercio sin código de escaneo', () => {
  it('servidor nuevo: sin código, pero sabe que tiene QR', () => {
    const shop = shopOutSchema.parse({ ...base, qr_code: null, has_qr: true })
    expect(toComercAdherit(shop).teQR).toBe(true)
  })

  it('servidor nuevo: comercio sin QR', () => {
    const shop = shopOutSchema.parse({ ...base, qr_code: null, has_qr: false })
    expect(toComercAdherit(shop).teQR).toBe(false)
  })

  it('servidor anterior: se sigue deduciendo del código', () => {
    const withCode = shopOutSchema.parse({ ...base, qr_code: 'abc123' })
    const without = shopOutSchema.parse({ ...base, qr_code: null })
    expect(toComercAdherit(withCode).teQR).toBe(true)
    expect(toComercAdherit(without).teQR).toBe(false)
  })
})
