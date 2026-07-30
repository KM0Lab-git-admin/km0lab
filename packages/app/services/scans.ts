/**
 * Scans — validación real del QR de un comercio (POST /scans).
 *
 * El backend exige Bearer de residente. El QR físico codifica
 * `https://app.km0lab.com/scan?c={token}`; aquí enviamos el token.
 */
import { ApiError, apiFetch, scanOutSchema, type ScanOut } from './km0labClient'

import type { ScanResult } from './mock/scanner'

/** POST /scans con el token del QR. */
export const scanQr = async (qrCode: string): Promise<ScanOut> => {
  return apiFetch('/scans', {
    method: 'POST',
    body: { qr_code: qrCode },
    schema: scanOutSchema,
    auth: true,
  })
}

/** ScanOut (201) → ScanResult ok. */
export const mapScanOk = (out: ScanOut): ScanResult => ({
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

/** Error de la llamada → ScanResult ko. */
export const mapScanError = (e: unknown): ScanResult => {
  if (e instanceof ApiError) {
    // 409 qr_cooldown → ya visitado (cooldown).
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
    // 404 Invalid QR → código no válido.
    if (e.status === 404) {
      return { ok: false, kind: 'codi_no_valid' }
    }
    // 400/401/403 y otros → sin conexión / no procesable.
    return { ok: false, kind: 'sense_connexio' }
  }
  return { ok: false, kind: 'sense_connexio' }
}
