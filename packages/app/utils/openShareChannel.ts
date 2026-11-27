import { Capacitor } from '@capacitor/core'

export type ShareChannelId = 'whatsapp' | 'email' | 'facebook'

export interface OpenShareChannelOptions {
  channel: ShareChannelId
  message: string
  subject: string
  link: string
}

/**
 * Abre WhatsApp, correo o Facebook con el mensaje ya montado.
 *
 * Capacitor 7 no tiene `App.openUrl`. En nativo el WebView enruta
 * `window.location` / `window.open` al intent del sistema (`whatsapp://`,
 * `mailto:`, https). En web: `wa.me`, `mailto` y `window.open`.
 * Si WhatsApp no está instalado, se cae a `wa.me`.
 */
export const openShareChannel = async ({
  channel,
  message,
  subject,
  link,
}: OpenShareChannelOptions): Promise<void> => {
  if (channel === 'whatsapp') {
    await openWhatsApp(message)
    return
  }
  if (channel === 'email') {
    await openUrl(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    )
    return
  }
  await openUrl(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
  )
}

const openWhatsApp = async (message: string): Promise<void> => {
  const encoded = encodeURIComponent(message)
  const webUrl = `https://wa.me/?text=${encoded}`
  if (!Capacitor.isNativePlatform()) {
    openWeb(webUrl)
    return
  }
  await openNativeSchemeWithFallback(`whatsapp://send?text=${encoded}`, webUrl)
}

const openNativeSchemeWithFallback = (
  nativeUrl: string,
  fallbackUrl: string
): Promise<void> =>
  new Promise((resolve) => {
    let settled = false
    const finish = (): void => {
      if (settled) return
      settled = true
      document.removeEventListener('visibilitychange', onHidden)
      resolve()
    }
    const onHidden = (): void => {
      if (document.visibilityState === 'hidden') finish()
    }
    document.addEventListener('visibilitychange', onHidden)
    window.location.href = nativeUrl
    window.setTimeout(() => {
      if (settled || document.visibilityState !== 'visible') return
      window.open(fallbackUrl, '_blank')
      finish()
    }, 1000)
  })

const openUrl = async (url: string): Promise<void> => {
  if (url.startsWith('mailto:')) {
    window.location.href = url
    return
  }
  if (Capacitor.isNativePlatform()) {
    window.open(url, '_blank')
    return
  }
  openWeb(url)
}

const openWeb = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
