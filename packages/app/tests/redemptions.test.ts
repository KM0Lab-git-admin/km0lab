import { afterEach, describe, expect, it, vi } from 'vitest'

import { onAccountChanged } from '../services/accountEvents'
import { ApiError } from '../services/km0labClient'
import { redeemReward } from '../services/redemptions'
import { toRedemptionStatus } from '../utils/redemptionMapper'

import { apiRedemption, mockApi } from './helpers'

type RewardInput = Parameters<typeof redeemReward>[0]

const reward = {
  id: 'rw1',
  title: 'Vale de 5 €',
  description: 'Para gastar en cualquier comercio',
  category: 'saldo',
  kind: 'voucher',
  valueLabel: '5 €',
  imageUrl: null,
} as unknown as RewardInput

afterEach(() => vi.unstubAllGlobals())

describe('canjear un premio', () => {
  it('un vale: pide el canje al servidor y devuelve su código', async () => {
    const { calls } = mockApi({
      'POST /redemptions': { status: 201, json: apiRedemption() },
    })
    const changed = vi.fn()
    const off = onAccountChanged(changed)

    const result = await redeemReward(reward)
    off()

    expect(calls).toEqual([
      { method: 'POST', path: '/redemptions', body: { reward_id: 'rw1' } },
    ])
    expect(result.code).toBe('12345')
    expect(result.costPoints).toBe(50)
    expect(result.status).toBe('ready')
    expect(changed).toHaveBeenCalledTimes(1)
  })

  it('un producto: no hay código y queda pendiente', async () => {
    mockApi({
      'POST /redemptions': {
        status: 201,
        json: apiRedemption({
          flow: 'delivery',
          status: 'requested',
          code: null,
          points_spent: 30,
        }),
      },
    })

    const result = await redeemReward(reward)

    expect(result.code).toBeNull()
    expect(result.status).toBe('pending')
    expect(result.costPoints).toBe(30)
  })

  it('sin saldo: el error del servidor llega tal cual y la cuenta no «cambia»', async () => {
    mockApi({
      'POST /redemptions': {
        status: 400,
        json: { detail: 'Insufficient points' },
      },
    })
    const changed = vi.fn()
    const off = onAccountChanged(changed)

    const attempt = redeemReward(reward)
    await expect(attempt).rejects.toBeInstanceOf(ApiError)
    await expect(attempt).rejects.toMatchObject({
      status: 400,
      message: 'Insufficient points',
    })
    off()
    expect(changed).not.toHaveBeenCalled()
  })
})

describe('estado de un canje', () => {
  it.each([
    ['requested', 'pending'],
    ['pending_preparation', 'pending'],
    ['prepared', 'pending'],
    ['pending_use', 'ready'],
    ['pending_pickup', 'ready'],
    ['used', 'redeemed'],
    ['delivered', 'redeemed'],
    ['cancelled', 'expired'],
  ])('%s → %s', (api, ui) => {
    expect(toRedemptionStatus(api)).toBe(ui)
  })

  it('un estado que la app no conoce se trata como pendiente', () => {
    expect(toRedemptionStatus('algo_nuevo')).toBe('pending')
  })
})
