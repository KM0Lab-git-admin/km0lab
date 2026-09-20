import { Capacitor } from '@capacitor/core'

import { env } from './env'

/**
 * Enlace canónico para compartir (WhatsApp, correo, copiar, Facebook).
 *
 * En Android nativo es la ficha de Play Store (sin path ni `ref`).
 * En iOS nativo, si existe `VITE_IOS_STORE_URL`, la ficha de App Store;
 * si no, la URL pública web. En web siempre `VITE_PUBLIC_APP_URL` + path/query.
 *
 * Nunca usar `window.location.origin`: en Capacitor es localhost.
 */
export const getShareLink = (
  path: string,
  searchParams: Record<string, string | null | undefined> = {}
): string => {
  const storeUrl = getNativeStoreListingUrl()
  if (storeUrl) return storeUrl

  const pathname = path.startsWith('/') ? path : `/${path}`
  const url = new URL(pathname, `${env.publicAppUrl}/`)
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}

const getNativeStoreListingUrl = (): string | null => {
  if (!Capacitor.isNativePlatform()) return null
  const platform = Capacitor.getPlatform()
  if (platform === 'android') return env.androidStoreUrl
  if (platform === 'ios' && env.iosStoreUrl) return env.iosStoreUrl
  return null
}
