/**
 * Utilidades de QR.
 */

/**
 * Extrae el token de un código leído por el escáner.
 * El QR físico codifica `https://app.km0lab.com/scan?c={token}`;
 * también aceptamos el token plano.
 */
export function extractToken(code: string | null | undefined): string {
  const raw = (code ?? '').trim()
  if (!raw) return ''
  // URL con ?c=
  const qIdx = raw.indexOf('?')
  if (qIdx >= 0) {
    try {
      const params = new URLSearchParams(raw.slice(qIdx + 1))
      const c = params.get('c')
      if (c) return c
    } catch {
      /* ignore */
    }
  }
  return raw
}
