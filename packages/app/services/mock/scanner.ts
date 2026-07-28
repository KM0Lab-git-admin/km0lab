/**
 * scannerMockService — Mock del escaneo de QR de comercio.
 *
 * FRONTERA: aquí NO se lee ninguna cámara real ni se escriben puntos en el
 * backend. Simula la latencia de validación y devuelve un `ScanResult` a
 * partir del `code` pedido, de forma que la UI puede demostrar cada estado
 * del flujo. La FIRMA es el contrato estable: cuando exista el servicio real
 * se sustituye la implementación sin tocar la UI ni la máquina.
 *
 * Propiedad de producción (`locked` en scripts/lovable-manifest.json). La
 * versión de Lovable importa `@/data/comerciosAdheridos`, que vive en la app
 * porque depende de assets, y packages/app no puede depender de la app.
 */

export type ScanErrorKind =
  | 'ja_visitat'
  | 'codi_no_valid'
  | 'qr_caducat'
  | 'sense_connexio'

export type ScanResult =
  | {
      ok: true
      comercId: string
      comercNom: string
      puntsGuanyats: number
      totalPunts: number
      nivell?: number
    }
  | {
      ok: false
      kind: ScanErrorKind
      comercNom?: string
    }

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const rand = (min: number, max: number) => min + Math.random() * (max - min)

/**
 * Códigos predefinidos para demostrar cada estado:
 *  - `OK_FORN_ROVIRA`  → éxito (+20 pts, total 1.260, nivel 4)
 *  - `ERR_JA_VISITAT`  → ya visitado (comercio conocido)
 *  - `ERR_CODI`        → código no válido
 *  - `ERR_CADUCAT`     → QR caducado
 *  - `ERR_CONNEXIO`    → sin conexión
 *  - cualquier otro    → éxito con el comercio por defecto
 */
export const scannerMockService = {
  async scan(code?: string): Promise<ScanResult> {
    await delay(rand(600, 1200))

    switch (code) {
      case 'ERR_JA_VISITAT':
        return { ok: false, kind: 'ja_visitat', comercNom: 'Forn Rovira' }
      case 'ERR_CODI':
        return { ok: false, kind: 'codi_no_valid' }
      case 'ERR_CADUCAT':
        return { ok: false, kind: 'qr_caducat' }
      case 'ERR_CONNEXIO':
        return { ok: false, kind: 'sense_connexio' }
      case 'OK_FORN_ROVIRA':
      default:
        return {
          ok: true,
          comercId: 'forn-rovira',
          comercNom: 'Forn Rovira',
          puntsGuanyats: 20,
          totalPunts: 1260,
          nivell: 4,
        }
    }
  },
}
