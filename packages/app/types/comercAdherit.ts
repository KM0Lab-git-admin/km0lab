import type { OpeningHoursOut } from '../services/km0labClient'

/**
 * Comerç adherit al programa de punts.
 * MOCK: sense API real; totes les dades vénen de `data/comerciosAdheridos.ts`.
 */
export interface ComercAdherit {
  id: string
  nom: string
  categoriaSlug: string
  categoriaNom: { ca: string; es: string }
  adreca: string
  /** Distància en metres. Null si l'API no aporta geo. */
  distanciaM?: number | null
  /** Punts que ofereix per compra / visita. */
  punts: number
  /** Si dóna punts escanejant QR al comerç. */
  teQR: boolean
  /** Emoji fallback quan no hi ha imatge. */
  emoji?: string
  /** URL del logo/miniatura. Opcional. */
  imatge?: string
  /** Classe Tailwind de fons de la miniatura (bg-km0-*). */
  bg?: string
  /** Si l'usuari ja ha escanejat aquest comerç (GET /shops/for-me). */
  scanned?: boolean
  /** Si pot guanyar punts ara (cooldown complert). */
  scanAvailable?: boolean
  /** Fecha ISO en què torna a estar disponible per punts (cooldown). */
  availableAt?: string | null
}

export interface CategoriaAdherit {
  slug: string
  nom: { ca: string; es: string }
  count: number
  emoji?: string
}

/** Promoció informativa d'un comerç (sense canje ni codi). */
export interface PromocioInfo {
  id: string
  etiqueta: string // "-5%", "2×1", "Regal"
  titol: { ca: string; es: string }
  detall: { ca: string; es: string }
  condicio?: { ca: string; es: string }
}

/** Detall complet d'un comerç adherit (mock, no API). */
export interface ComercDetall {
  id: string
  nom: string
  categoria: { ca: string; es: string }
  subcategoria?: { ca: string; es: string }
  imatge?: string
  emoji?: string
  bg?: string
  obertAra: boolean
  horariAvui: string // "07:00–20:00"
  tancaA?: string // "20:00"
  /** Horari setmanal (JSON API `opening_hours`). */
  openingHours?: OpeningHoursOut | null
  adreca: string
  codiPostal: string
  poblacio: string
  /** Distància en metres. Null si l'API no aporta geo. */
  distanciaM?: number | null
  telefon?: string
  web?: string
  coordenades?: { lat: number; lng: number }
  descripcio: { ca: string; es: string }
  punts: number
  visitat: boolean
  promocions: PromocioInfo[]
}
