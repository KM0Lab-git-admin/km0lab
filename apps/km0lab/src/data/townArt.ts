import genericTown from '@/assets/burbuja/home-town-burbuja.webp.asset.json'

// Add municipality-specific artwork only when the corresponding asset exists.
export const TOWN_ART_BY_POSTAL_CODE: Readonly<Record<string, string>> = {}
export const DEFAULT_TOWN_ART = genericTown.url

export const getTownArt = (postalCode: string | null): string =>
  (postalCode ? TOWN_ART_BY_POSTAL_CODE[postalCode] : undefined) ??
  DEFAULT_TOWN_ART
