import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import {
  extractInviteCodeFromUrl,
  getCanonicalWebLink,
  persistPendingInvite,
  resolveInviteCode,
  trackInviteEvent,
} from '@km0lab/app'

/**
 * Marca el documento como nativo para que el CSS oculte el halo azul
 * del marco también en iPad / tablets (viewport grande).
 */
export function applyNativeDocumentClass(): void {
  document.documentElement.classList.toggle(
    'is-native',
    Capacitor.isNativePlatform()
  )
}

const openInvitePath = (code: string) => {
  const path = `/i/${encodeURIComponent(code)}`
  if (Capacitor.isNativePlatform()) {
    window.location.hash = path
    return
  }
  if (!window.location.pathname.startsWith('/i/')) {
    window.location.assign(path)
  }
}

async function handleOpenUrl(
  url: string,
  source: 'app_link' | 'install_referrer'
) {
  const code = extractInviteCodeFromUrl(url)
  if (!code) return
  try {
    const resolved = await resolveInviteCode(code)
    if (resolved.valid && resolved.code && resolved.kind) {
      persistPendingInvite({
        code: resolved.code,
        kind: resolved.kind,
        townId: resolved.town_id,
        townName: resolved.town_name,
      })
    } else {
      persistPendingInvite({ code, kind: 'person' })
    }
  } catch {
    persistPendingInvite({ code, kind: 'person' })
  }
  if (source === 'install_referrer') {
    void trackInviteEvent({
      type: 'install_referrer_recovered',
      code,
      channel: 'other',
    })
  }
  openInvitePath(code)
}

/**
 * Inicializa plugins nativos de Capacitor (StatusBar + SplashScreen).
 *
 * No-op en web: `Capacitor.isNativePlatform()` filtra toda la lógica
 * para que el build web no toque APIs nativas.
 *
 * Se llama desde `main.tsx` antes de montar React.
 */
export async function setupCapacitor(): Promise<void> {
  applyNativeDocumentClass()
  if (!Capacitor.isNativePlatform()) return

  try {
    await StatusBar.setOverlaysWebView({ overlay: false })
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#FFECD2' })
  } catch {
    /* StatusBar no disponible en esta plataforma */
  }

  try {
    await SplashScreen.hide()
  } catch {
    /* SplashScreen no configurado */
  }

  await tryRecoverInstallReferrer()

  try {
    CapApp.addListener('appUrlOpen', ({ url }) => {
      void handleOpenUrl(url, 'app_link')
    })
    const launch = await CapApp.getLaunchUrl()
    if (launch?.url) {
      void handleOpenUrl(launch.url, 'app_link')
    }
  } catch {
    /* App plugin no disponible */
  }
}

type ReferrerPlugin = {
  getReferrer?: () => Promise<{ referrer?: string }>
}

/**
 * Play Install Referrer: stub JS. Sin plugin nativo no hay deferred
 * deep linking desde la ficha de Play. Si un plugin registra
 * `PlayInstallReferrer.getReferrer()`, se recupera el código.
 */
async function tryRecoverInstallReferrer(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    const plugins = (
      Capacitor as unknown as { Plugins?: Record<string, ReferrerPlugin> }
    ).Plugins
    const result = await plugins?.PlayInstallReferrer?.getReferrer?.()
    const referrer = result?.referrer?.trim()
    if (!referrer) return
    const fromPath = extractInviteCodeFromUrl(
      referrer.includes('://')
        ? referrer
        : `${getCanonicalWebLink('/')}?${referrer}`
    )
    const params = new URLSearchParams(referrer)
    const fromQuery =
      params.get('invite_code') ||
      params.get('ref') ||
      params.get('utm_content')
    const code = (fromPath || fromQuery || '').trim().toLowerCase()
    if (!code) return
    await handleOpenUrl(getCanonicalWebLink(`/i/${code}`), 'install_referrer')
  } catch {
    /* plugin ausente: el código vive en la web /i/{code} */
  }
}
