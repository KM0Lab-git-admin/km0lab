import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

/**
 * Inicializa plugins nativos de Capacitor (StatusBar + SplashScreen).
 *
 * No-op en web: `Capacitor.isNativePlatform()` filtra toda la lógica
 * para que el build web no toque APIs nativas.
 *
 * Se llama desde `main.tsx` antes de montar React.
 */
export async function setupCapacitor(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    // La WebView no se dibuja debajo de la status bar (evita recortes en Home).
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
}
