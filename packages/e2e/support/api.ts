/**
 * Llamadas directas a los servidores, para preparar y para comprobar.
 * Los recorridos usan la pantalla; esto es lo de alrededor: salud,
 * territorio de pruebas y «lo que la app vio coincide con lo que hay».
 */
import {
  apiURL,
  eventsURL,
  fixedCode,
  qaPostalCode,
  qaToken,
  runId,
} from './env'

const API = `${apiURL}/api/v1`

/**
 * La clave del robot. Con ella la API no le aplica los límites por IP
 * (una ejecución da de alta una docena de vecinos). Sin clave, todo
 * funciona igual pero sujeto a esos límites.
 */
export const robotHeaders: Record<string, string> = qaToken
  ? { 'X-QA-Token': qaToken }
  : {}

export class ApiFailure extends Error {
  constructor(
    public status: number,
    public body: string,
    what: string
  ) {
    super(`${what}: ${status} ${body.slice(0, 300)}`)
  }
}

const json = async <T>(what: string, res: Response): Promise<T> => {
  const body = await res.text()
  if (!res.ok) throw new ApiFailure(res.status, body, what)
  return JSON.parse(body) as T
}

export const apiGet = async <T>(
  path: string,
  params?: Record<string, string>,
  token?: string
): Promise<T> => {
  const url = new URL(`${API}${path}`)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  return json<T>(`GET ${path}`, res)
}

export type Health = {
  status: string
  version: string
  environment?: string
  commit?: string | null
}

export const apiHealth = () => apiGet<Health>('/health')

export const eventsHealth = async (): Promise<number> => {
  const res = await fetch(`${eventsURL}/docs`)
  return res.status
}

export type TownPublic = {
  id: string
  name: string
  default_visit_points: number
}

export const townByPostalCode = (postalCode: string) =>
  apiGet<TownPublic>('/towns/public', { postal_code: postalCode })

/**
 * Deja el territorio de pruebas listo: borra lo que crearon ejecuciones
 * anteriores (de más de dos horas) y repara el sembrado. Solo si hay clave;
 * sin ella se asume que ya está sembrado (`python -m scripts.seed_qa`).
 */
export const prepareQaTerritory = async (): Promise<unknown | null> => {
  if (!qaToken) return null
  const res = await fetch(`${API}/qa/prepare?older_than_minutes=120`, {
    method: 'POST',
    headers: { 'X-QA-Token': qaToken },
  })
  return json('POST /qa/prepare', res)
}

/** Cuenta nueva de esta ejecución: `qa+r<id>-<nombre>@km0lab.com`. */
export const qaEmail = (name: string) =>
  `qa+r${runId}-${name}`.toLowerCase().slice(0, 60) + '@km0lab.com'

export type Session = {
  access_token: string
  user: {
    id: string
    email: string
    points: number
    postal_code: string
    roles: string[]
    shop_id?: string | null
  }
  points_awarded?: number | null
}

/**
 * Entra (o da de alta) una cuenta de prueba directamente contra la API.
 * Para preparar el segundo vecino de un recorrido o comprobar un saldo
 * sin pasar otra vez por las pantallas.
 */
export const qaLogin = async (
  email: string,
  extra: { invite_code?: string } = {}
): Promise<Session> => {
  const res = await fetch(`${API}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...robotHeaders },
    body: JSON.stringify({
      email,
      code: fixedCode,
      postal_code: qaPostalCode,
      ...extra,
    }),
  })
  return json<Session>(`verify-otp ${email}`, res)
}

export type Me = {
  id: string
  points: number
  first_name: string | null
  postal_code: string | null
}

export const me = (token: string) => apiGet<Me>('/users/me', undefined, token)

export type LedgerEntry = { points: number; type: string }
