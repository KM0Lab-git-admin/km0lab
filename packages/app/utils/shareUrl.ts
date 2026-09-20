import { Capacitor } from '@capacitor/core'

import { env } from './env'

/**
 * Base web para `/i/{code}` y shares.
 *
 * En Capacitor nunca usamos `window.location.origin` (es localhost).
 * En web local (`development`) sí: el copy tiene que abrir este Vite, no UAT.
 */
const webShareOrigin = (): string => {
  if (
    env.appEnv === 'development' &&
    typeof window !== 'undefined' &&
    !Capacitor.isNativePlatform()
  ) {
    return window.location.origin
  }
  return env.publicAppUrl
}

const buildWebLink = (
  path: string,
  searchParams: Record<string, string | null | undefined>,
  origin: string
): string => {
  const pathname = path.startsWith('/') ? path : `/${path}`
  const url = new URL(pathname, `${origin}/`)
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}

/**
 * Enlace canónico para compartir (WhatsApp, correo, copiar, Facebook).
 *
 * Enlace genérico de la app (home, etc.): en nativo puede ser la ficha de
 * tienda. Las invitaciones usan `getCanonicalWebLink` (`/i/{code}`), nunca
 * solo Play, para no perder el código.
 */
export const getShareLink = (
  path: string,
  searchParams: Record<string, string | null | undefined> = {}
): string => {
  const storeUrl = getNativeStoreListingUrl()
  if (storeUrl) return storeUrl
  return buildWebLink(path, searchParams, webShareOrigin())
}

/** URL web canónica. Nunca Play Store: hace falta para no perder el código. */
export const getCanonicalWebLink = (
  path: string,
  searchParams: Record<string, string | null | undefined> = {}
): string => buildWebLink(path, searchParams, webShareOrigin())

const getNativeStoreListingUrl = (): string | null => {
  if (!Capacitor.isNativePlatform()) return null
  const platform = Capacitor.getPlatform()
  if (platform === 'android') return env.androidStoreUrl
  if (platform === 'ios' && env.iosStoreUrl) return env.iosStoreUrl
  return null
}
