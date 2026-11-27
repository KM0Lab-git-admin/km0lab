import { notifyAccountChanged } from './accountEvents'
import { ApiError, apiFetch, scanOutSchema, type ScanOut } from './km0labClient'

import type { ScanErrorKind, ScanResult } from '../types/scan'

/**
 * Resultado de un escaneo tal como lo usa producción. Es el `ScanResult`
 * de pantalla más `availableAt`: la fecha en que el comercio vuelve a dar
 * puntos, que el servidor devuelve cuando el QR ya se escaneó.
 */
export type ScanOutcome =
  | Extract<ScanResult, { ok: true }>
  | {
      ok: false
      kind: ScanErrorKind
      comercNom?: string
      /** ISO (YYYY-MM-DD). */
      availableAt?: string
    }

/** Escaneo QR de visita. POST /scans (Bearer, rol resident). */
export const scanQr = async (qrCode: string): Promise<ScanOut> => {
  return apiFetch('/scans', {
    method: 'POST',
    body: { qr_code: qrCode },
    schema: scanOutSchema,
    auth: true,
  })
}

export const mapScanOk = (out: ScanOut): ScanOutcome => ({
  ok: true,
  comercId: out.shop_id,
  comercNom: out.shop_name ?? '',
  puntsGuanyats: out.points,
  totalPunts: out.balance,
})

type CooldownDetail = {
  code?: string
  shop_id?: string
  shop_name?: string
  available_at?: string
  cooldown_days?: number
}

/** Convierte un error de la API en el resultado que pinta el escáner. */
export const mapScanError = (e: unknown): ScanOutcome => {
  if (e instanceof ApiError) {
    if (e.status === 409) {
      const d = (e.detail ?? {}) as CooldownDetail
      if (d.code === 'qr_cooldown' || d.available_at) {
        return {
          ok: false,
          kind: 'ja_visitat',
          comercNom: d.shop_name,
          availableAt: d.available_at,
        }
      }
      return { ok: false, kind: 'sense_connexio' }
    }
    if (e.status === 404) {
      return { ok: false, kind: 'codi_no_valid' }
    }
    return { ok: false, kind: 'sense_connexio' }
  }
  return { ok: false, kind: 'sense_connexio' }
}

/** Escaneos en curso, por token: evita mandar dos veces el mismo QR. */
const inFlight = new Map<string, Promise<ScanOutcome>>()

/**
 * Valida un QR contra el servidor y avisa de que la cuenta ha cambiado
 * (saldo e historial) cuando el escaneo abona puntos.
 *
 * Si llega el mismo token mientras su petición sigue en curso (doble
 * detección de la cámara, efecto repetido en desarrollo), se reutiliza la
 * petición: un escaneo no se manda dos veces.
 */
export const scanShopQr = (token: string): Promise<ScanOutcome> => {
  const pending = inFlight.get(token)
  if (pending) return pending
  const request = scanQr(token)
    .then((out) => {
      notifyAccountChanged()
      return mapScanOk(out)
    })
    .catch((e: unknown) => mapScanError(e))
    .finally(() => {
      inFlight.delete(token)
    })
  inFlight.set(token, request)
  return request
}
