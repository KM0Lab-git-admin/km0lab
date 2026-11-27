import { afterEach, describe, expect, it, vi } from 'vitest'

import { onAccountChanged } from '../services/accountEvents'
import { isOncePerShop, scanShopQr } from '../services/scans'

import { mockApi } from './helpers'

const scanOk = {
  id: 's1',
  shop_id: 'shop1',
  shop_name: 'Forn de la plaça',
  points: 15,
  created_at: '2026-11-20T10:00:00',
  balance: 115,
  available_at: '2026-12-20',
}

afterEach(() => vi.unstubAllGlobals())

describe('escaneo de un QR', () => {
  it('devuelve comercio, puntos y saldo, y avisa de que la cuenta cambió', async () => {
    const { calls } = mockApi({ 'POST /scans': { status: 201, json: scanOk } })
    const changed = vi.fn()
    const off = onAccountChanged(changed)

    const result = await scanShopQr('token-1')
    off()

    expect(result).toEqual({
      ok: true,
      comercId: 'shop1',
      comercNom: 'Forn de la plaça',
      puntsGuanyats: 15,
      totalPunts: 115,
    })
    expect(calls).toEqual([
      { method: 'POST', path: '/scans', body: { qr_code: 'token-1' } },
    ])
    expect(changed).toHaveBeenCalledTimes(1)
  })

  it('no manda dos veces el mismo QR mientras la primera petición sigue en curso', async () => {
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const { fetchMock } = mockApi({
      'POST /scans': async () => {
        await gate
        return { status: 201, json: scanOk }
      },
    })

    const first = scanShopQr('token-doble')
    const second = scanShopQr('token-doble')
    release?.()
    const [a, b] = await Promise.all([first, second])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(a).toEqual(b)

    // Terminada la primera, un escaneo nuevo sí vuelve a preguntar.
    await scanShopQr('token-doble')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('un comercio ya visitado dice cuándo vuelve a dar puntos', async () => {
    mockApi({
      'POST /scans': {
        status: 409,
        json: {
          detail: {
            code: 'qr_cooldown',
            shop_name: 'Forn de la plaça',
            available_at: '2026-12-20',
          },
        },
      },
    })
    const changed = vi.fn()
    const off = onAccountChanged(changed)

    const result = await scanShopQr('token-repetido')
    off()

    expect(result).toEqual({
      ok: false,
      kind: 'ja_visitat',
      comercNom: 'Forn de la plaça',
      availableAt: '2026-12-20',
    })
    expect(changed).not.toHaveBeenCalled()
  })

  it('un QR que no es de KM0 es «código no válido»', async () => {
    mockApi({ 'POST /scans': { status: 404, json: { detail: 'Invalid QR' } } })
    expect(await scanShopQr('token-falso')).toEqual({
      ok: false,
      kind: 'codi_no_valid',
    })
  })

  it('sin conexión no lo confunde con un QR falso', async () => {
    mockApi({ 'POST /scans': new TypeError('Failed to fetch') })
    expect(await scanShopQr('token-sin-red')).toEqual({
      ok: false,
      kind: 'sense_connexio',
    })
  })

  it('una respuesta que la app no entiende no se da por buena', async () => {
    mockApi({ 'POST /scans': { status: 201, json: { id: 's1' } } })
    const result = await scanShopQr('token-raro')
    expect(result.ok).toBe(false)
  })
})

describe('un comercio que da puntos una sola vez', () => {
  const today = Date.parse('2026-11-27T12:00:00Z')

  it('una espera de un año se cuenta como «una sola vez»', () => {
    expect(isOncePerShop('2027-11-27', today)).toBe(true)
  })

  it('la espera normal de 30 días sigue enseñando su fecha', () => {
    expect(isOncePerShop('2026-12-27', today)).toBe(false)
  })

  it('sin fecha, o con una que no se entiende, no se inventa nada', () => {
    expect(isOncePerShop(undefined, today)).toBe(false)
    expect(isOncePerShop(null, today)).toBe(false)
    expect(isOncePerShop('pronto', today)).toBe(false)
  })
})
