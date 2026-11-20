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
  | { ok: false; kind: ScanErrorKind; comercNom?: string }
