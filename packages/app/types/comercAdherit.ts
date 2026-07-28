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
  /** Distància en metres (mock). */
  distanciaM: number
  /** Punts que ofereix per compra (mock). */
  punts: number
  /** Si dóna punts escanejant QR al comerç. */
  teQR: boolean
  /** Emoji fallback quan no hi ha imatge. */
  emoji?: string
  /** URL del logo/miniatura. Opcional. */
  imatge?: string
  /** Classe Tailwind de fons de la miniatura (bg-km0-*). */
  bg?: string
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
  adreca: string
  codiPostal: string
  poblacio: string
  distanciaM: number
  telefon?: string
  web?: string
  coordenades?: { lat: number; lng: number }
  descripcio: { ca: string; es: string }
  punts: number
  visitat: boolean
  promocions: PromocioInfo[]
}
