/**
 * Escaneo pendiente.
 *
 * Quien abre el enlace de la pegatina de un comercio (`/scan?c=…`) sin
 * sesión, o sin haber usado nunca la app, tiene que pasar antes por idioma,
 * código postal y registro. El código del QR se guarda mientras tanto y el
 * escaneo se retoma solo al terminar: el vecino no escanea dos veces.
 */

export interface PendingScan {
  /** Código del QR del comercio (el valor de `c`). */
  code: string
  /** Momento en que se abrió el enlace (ms). */
  at: number
}

/** Pasado este tiempo, el escaneo pendiente se olvida. */
export const PENDING_SCAN_TTL_MS = 2 * 60 * 60 * 1000

export const isPendingScanFresh = (
  pending: PendingScan | null | undefined,
  now: number
): pending is PendingScan =>
  !!pending?.code &&
  now - pending.at >= 0 &&
  now - pending.at < PENDING_SCAN_TTL_MS

/** Ruta del escáner que valida ese código nada más abrirse. */
export const scannerPathFor = (code: string): string =>
  `/scanner?c=${encodeURIComponent(code)}`

/** Pantallas en las que el vecino ya está entrando: no se le interrumpe. */
const AUTH_PATHS = ['/login', '/check-email']

export type PendingScanStep =
  /** No hay nada pendiente. */
  | 'none'
  /** Lo pendiente ha caducado: hay que borrarlo. */
  | 'expired'
  /** Aún no toca: falta idioma o código postal, o la app está arrancando. */
  | 'wait'
  /** Tiene todo menos sesión: se le lleva a entrar (una sola vez). */
  | 'login'
  /** Tiene todo: se retoma el escaneo. */
  | 'resume'

export interface PendingScanContext {
  pending: PendingScan | null | undefined
  now: number
  /** El almacén ya se ha leído del dispositivo y la sesión está comprobada. */
  ready: boolean
  /** Idioma y código postal elegidos. */
  setupDone: boolean
  hasSession: boolean
  pathname: string
  /** Ya se le llevó a entrar por este escaneo: no se insiste. */
  loginPrompted: boolean
}

export function pendingScanStep(ctx: PendingScanContext): PendingScanStep {
  if (!ctx.pending) return 'none'
  if (!isPendingScanFresh(ctx.pending, ctx.now)) return 'expired'
  if (!ctx.ready || !ctx.setupDone) return 'wait'
  // El escáner ya lo tiene entre manos (y lo borra al validarlo).
  if (ctx.pathname.startsWith('/scanner')) return 'wait'
  if (ctx.hasSession) return 'resume'
  if (AUTH_PATHS.includes(ctx.pathname) || ctx.loginPrompted) return 'wait'
  return 'login'
}
