import { afterEach, describe, expect, it, vi } from 'vitest'

import { otpErrorKey, otpErrorKind } from '../services/auth'
import {
  getMyInviteSummary,
  listMyConversions,
  NO_FRIEND_LIMIT,
} from '../services/invites'
import { ApiError } from '../services/km0labClient'
import { useAppStore } from '../stores/useAppStore'
import { getFriendProgress } from '../utils/inviteProgress'
import { toPointActions } from '../utils/pointActionMapper'

import { mockApi } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  useAppStore.getState().setToken(null)
})

const summary = (over: Record<string, unknown> = {}) => ({
  persons_registered: 2,
  businesses_registered: 0,
  points_earned: 100,
  points_pending: 0,
  friend_limit: 3,
  friends_rewarded: 2,
  ...over,
})

describe('resumen de invitaciones', () => {
  it('trae el tope de amigos premiados que dice el servidor', async () => {
    useAppStore.getState().setToken('t')
    mockApi({ 'GET /invites/me/summary': { json: summary() } })

    const data = await getMyInviteSummary()

    expect(data).toEqual({
      personsRegistered: 2,
      pointsEarned: 100,
      pointsPending: 0,
      friendLimit: 3,
    })
    expect(getFriendProgress(data)).toEqual({
      count: 2,
      limit: 3,
      rewarding: true,
      reached: false,
    })
  })

  it('con el tope alcanzado, los amigos de más no cuentan en la barra', async () => {
    useAppStore.getState().setToken('t')
    mockApi({
      'GET /invites/me/summary': { json: summary({ persons_registered: 4 }) },
    })

    expect(getFriendProgress(await getMyInviteSummary())).toMatchObject({
      count: 3,
      reached: true,
    })
  })

  it('tope 0: invitar no suma puntos', async () => {
    useAppStore.getState().setToken('t')
    mockApi({
      'GET /invites/me/summary': { json: summary({ friend_limit: 0 }) },
    })

    expect(getFriendProgress(await getMyInviteSummary()).rewarding).toBe(false)
  })

  it('sin tope en el municipio, o con una API anterior al tope, no se alcanza', async () => {
    useAppStore.getState().setToken('t')
    for (const body of [
      summary({ friend_limit: null }),
      { persons_registered: 5, points_earned: 250, points_pending: 0 },
    ]) {
      mockApi({ 'GET /invites/me/summary': { json: body } })
      const data = await getMyInviteSummary()
      expect(data.friendLimit).toBe(NO_FRIEND_LIMIT)
      expect(getFriendProgress(data).reached).toBe(false)
    }
  })

  it('la lista es solo de amigos: no se piden ni se enseñan negocios', async () => {
    useAppStore.getState().setToken('t')
    const { calls } = mockApi({
      'GET /invites/me/conversions': {
        json: {
          total: 2,
          items: [
            { id: 'c1', kind: 'person', status: 'granted', points: 50 },
            { id: 'c2', kind: 'business', status: 'granted', points: 500 },
          ],
        },
      },
    })

    const rows = await listMyConversions()

    expect(calls[0]?.path).toBe('/invites/me/conversions?kind=person')
    expect(rows.map((row) => row.id)).toEqual(['c1'])
  })
})

describe('formas de ganar puntos', () => {
  const action = (type: string, points: number) => ({
    id: `a-${type}`,
    town_id: 't1',
    type,
    name: type,
    description: '',
    points,
    visible_home: true,
    active: true,
  })

  it('la App enseña las tres del piloto y ninguna otra', () => {
    const shown = toPointActions([
      action('signup', 50),
      action('qr_scan', 100),
      action('invite_person', 50),
      // Encendidas por error en un municipio: la App no tiene cómo pintarlas.
      action('birthday', 500),
      action('invite_business', 500),
      action('web_visit', 20),
    ])

    expect(shown.map((a) => [a.apiType, a.points, a.icon])).toEqual([
      ['signup', 50, 'user-plus'],
      ['scan', 100, 'qr'],
      ['invite_friend', 50, 'share'],
    ])
  })
})

describe('piloto completo', () => {
  it('es un motivo propio, no «código incorrecto»', () => {
    const full = new ApiError(409, 'El pilot està complet', {
      code: 'pilot_full',
      message: 'El pilot està complet',
    })

    expect(otpErrorKind(full)).toBe('pilot_full')
    expect(otpErrorKey('pilot_full')).toBe('pilot.full.title')
  })
})
