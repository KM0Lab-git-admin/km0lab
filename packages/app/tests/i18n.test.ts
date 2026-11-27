import { describe, expect, it } from 'vitest'

import { LANGS, t as tLovable } from '../utils/i18n'
import { t } from '../utils/i18nProd'
import { toPointsTransaction } from '../utils/pointsHistoryMapper'

describe('textos de producción sobre los de Lovable', () => {
  it('un texto propio de producción gana al de la maqueta', () => {
    expect(tLovable('postal.placeholder', 'es')).toBe('08380')
    expect(t('postal.placeholder', 'es')).toBe('00000')
  })

  it('lo que producción no redefine sale del diccionario de Lovable', () => {
    for (const lang of LANGS) {
      expect(t('common.continue', lang)).toBe(tLovable('common.continue', lang))
    }
  })

  it('los avisos de «demostración» y «prototipo» de la maqueta no salen', () => {
    for (const lang of LANGS) {
      expect(t('account.demo', lang)).toBe('')
      expect(t('account.sheet.demo', lang)).toBe('')
      expect(t('catalog.sample', lang)).toBe('')
      expect(t('business.success.mock_note', lang)).toBe('')
      expect(t('business.email.access_hint', lang)).toBe('')
    }
  })

  it('los textos de acceso no hablan de prototipo ni de código de prueba', () => {
    const keys = [
      'login.subtitle',
      'otp.subtitle',
      'otp.footer_hint',
      'home.welcome.points',
    ] as const
    for (const lang of LANGS) {
      for (const key of keys) {
        const text = t(key, lang)
        expect(text.length).toBeGreaterThan(0)
        expect(text).not.toMatch(/prototip|123456|demo|100/i)
      }
    }
  })
})

describe('movimientos del historial', () => {
  const item = (over: Record<string, unknown>) =>
    ({
      id: 'm1',
      type: 'scan',
      points: 15,
      created_at: '2026-11-20T10:00:00',
      ...over,
    }) as Parameters<typeof toPointsTransaction>[0]

  it('la bienvenida, el escaneo y el canje llevan su concepto', () => {
    expect(toPointsTransaction(item({ type: 'welcome' })).type).toBe('signup')
    expect(toPointsTransaction(item({ type: 'scan' })).type).toBe('scan')
    expect(
      toPointsTransaction(item({ type: 'redemption', points: -50 })).type
    ).toBe('redeem')
  })

  it('las invitaciones no enseñan el nombre de un comercio', () => {
    const tx = toPointsTransaction(
      item({ type: 'invite_person', points: 150, shop_name: 'Forn' })
    )
    expect(tx.type).toBe('invite_person')
    expect(tx.place).toBeUndefined()
  })

  it('un gasto de un tipo desconocido se enseña como canje, no como ingreso', () => {
    const tx = toPointsTransaction(item({ type: 'otro', points: -20 }))
    expect(tx.type).toBe('redeem')
    expect(tx.points).toBe(-20)
  })
})
