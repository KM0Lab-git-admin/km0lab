/**
 * Un servidor de mentira para las pruebas rápidas.
 *
 * Sustituye `fetch` y deja pasar todo lo demás: el cliente real, sus
 * esquemas de validación y los servicios. Así una prueba comprueba a la
 * vez qué manda la app y si entiende lo que recibe.
 */
import { vi } from 'vitest'

export type Call = { method: string; path: string; body: unknown }

type Reply = { status?: number; json?: unknown } | Error

type Handler = Reply | ((call: Call) => Reply | Promise<Reply>)

const API = 'http://api.test/api/v1'

export const mockApi = (routes: Record<string, Handler>) => {
  const calls: Call[] = []

  const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = String(input)
    const method = (init?.method ?? 'GET').toUpperCase()
    const path = url.replace(API, '')
    const call: Call = {
      method,
      path,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    }
    calls.push(call)

    const key = `${method} ${path.split('?')[0]}`
    const handler = routes[key]
    if (!handler) throw new Error(`Petición no prevista en la prueba: ${key}`)
    const reply = typeof handler === 'function' ? await handler(call) : handler
    if (reply instanceof Error) throw reply
    return new Response(JSON.stringify(reply.json ?? null), {
      status: reply.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })

  vi.stubGlobal('fetch', fetchMock)

  /** La primera petición que hizo la app; falla si no hizo ninguna. */
  const first = (): Call => {
    const call = calls[0]
    if (!call) throw new Error('La app no hizo ninguna petición')
    return call
  }

  return { calls, first, fetchMock }
}

/** Lo que devuelve la API para un usuario (GET/PATCH /users/me). */
export const apiUser = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  email: 'vecina@example.com',
  slug: 'vecina',
  first_name: 'Marta',
  last_name: 'Puig',
  lang: 'ca',
  postal_code: '08380',
  town_id: 't1',
  town_name: 'Malgrat de Mar',
  points: 120,
  roles: ['resident'],
  created_at: '2026-11-20T10:00:00',
  ...over,
})

/** Lo que devuelve la API al canjear (POST /redemptions). */
export const apiRedemption = (over: Record<string, unknown> = {}) => ({
  id: 'r1',
  town_id: 't1',
  user_id: 'u1',
  reward_id: 'rw1',
  flow: 'voucher_qr',
  points_spent: 50,
  status: 'pending_use',
  code: '12345',
  amount: null,
  requested_at: '2026-11-20T10:00:00',
  ...over,
})
