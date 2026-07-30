/**
 * Mapper ShopOut (km0lab-api) → modelos de UI de comercios.
 */
import { t, type Lang, type TKey } from './i18n'
import { closesAtToday, isOpenNow, todayHoursLabel } from './openingHours'
import { resolveMediaUrl } from './rewardMapper'
import { shopCategoryEmoji } from './shopCategoryEmoji'

import type { ShopOut, ShopResidentOut } from '../services/km0labClient'
import type {
  CategoriaAdherit,
  ComercAdherit,
  ComercDetall,
  PromocioInfo,
} from '../types/comercAdherit'

const KNOWN_CATEGORY_SLUGS = new Set([
  'bakery',
  'food',
  'cafe',
  'restaurant',
  'bar',
  'butcher',
  'greengrocer',
  'fishmonger',
  'pharmacy',
  'bookstore',
  'clothing',
  'hairdresser',
  'services',
  'other',
])

const categoryKey = (slug: string): TKey =>
  (KNOWN_CATEGORY_SLUGS.has(slug)
    ? `shopCategories.${slug}`
    : 'shopCategories.other') as TKey

const categoryLabel = (slug: string, lang: Lang): string =>
  t(categoryKey(slug), lang)

const categoryNom = (slug: string): { ca: string; es: string } => ({
  ca: categoryLabel(slug, 'ca'),
  es: categoryLabel(slug, 'es'),
})

const stripWebsite = (url: string | null | undefined): string | undefined => {
  if (!url?.trim()) return undefined
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

/** ShopOut | ShopResidentOut → tarjeta del listado. */
export function toComercAdherit(
  shop: ShopOut | ShopResidentOut
): ComercAdherit {
  const slug = shop.categories[0]?.trim() || 'other'
  const scanFields =
    'scanned' in shop
      ? {
          scanned: shop.scanned,
          scanAvailable: shop.scan_available,
          availableAt: shop.available_at,
        }
      : {}
  return {
    id: shop.id,
    nom: shop.name,
    categoriaSlug: slug,
    categoriaNom: categoryNom(slug),
    adreca: shop.address?.trim() || '—',
    distanciaM: null,
    punts: shop.visit_points ?? 0,
    teQR: Boolean(shop.qr_code?.trim()),
    emoji: shop.emoji?.trim() || shopCategoryEmoji(slug),
    imatge:
      shop.has_logo && shop.logo_url
        ? (resolveMediaUrl(shop.logo_url) ?? undefined)
        : undefined,
    ...scanFields,
  }
}

export type ToComercDetallOpts = {
  visitat?: boolean
  promocions?: PromocioInfo[]
}

/** ShopOut → ficha de detalle. */
export function toComercDetall(
  shop: ShopOut,
  lang: Lang,
  opts: ToComercDetallOpts = {}
): ComercDetall {
  const primary = shop.categories[0]?.trim() || 'other'
  const secondary = shop.categories[1]?.trim()
  const hours = shop.opening_hours ?? null
  const labelCa = categoryLabel(primary, 'ca')
  const labelEs = categoryLabel(primary, 'es')
  const desc = shop.description?.trim() || ''

  const hero =
    shop.has_hero && shop.hero_url
      ? resolveMediaUrl(shop.hero_url)
      : shop.has_logo && shop.logo_url
        ? resolveMediaUrl(shop.logo_url)
        : null

  return {
    id: shop.id,
    nom: shop.name,
    categoria: { ca: labelCa, es: labelEs },
    subcategoria: secondary
      ? {
          ca: categoryLabel(secondary, 'ca'),
          es: categoryLabel(secondary, 'es'),
        }
      : undefined,
    imatge: hero ?? undefined,
    emoji: shop.emoji?.trim() || shopCategoryEmoji(primary),
    obertAra: isOpenNow(hours),
    horariAvui: todayHoursLabel(hours, lang),
    tancaA: closesAtToday(hours),
    openingHours: hours,
    adreca: shop.address?.trim() || '—',
    codiPostal: shop.postal_code?.trim() || '',
    poblacio: shop.town_name?.trim() || '',
    distanciaM: null,
    telefon: shop.phone?.trim() || undefined,
    web: stripWebsite(shop.website),
    descripcio: { ca: desc, es: desc },
    punts: shop.visit_points ?? 0,
    visitat: opts.visitat ?? false,
    promocions: opts.promocions ?? [],
  }
}

/** Agrupa comercios mapeados en categorías para el filtro. */
export function buildShopCategories(
  items: ComercAdherit[],
  allLabel: { ca: string; es: string }
): CategoriaAdherit[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.categoriaSlug, (counts.get(item.categoriaSlug) ?? 0) + 1)
  }
  const cats: CategoriaAdherit[] = [
    {
      slug: 'totes',
      nom: allLabel,
      count: items.length,
    },
  ]
  for (const [slug, count] of [...counts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    cats.push({
      slug,
      nom: categoryNom(slug),
      count,
    })
  }
  return cats
}
