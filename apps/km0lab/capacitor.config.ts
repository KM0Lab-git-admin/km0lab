import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor config para KM0 LAB.
 *
 * webDir apunta a la build de Vite (`dist/`). Cuando hagas
 * `pnpm cap:sync` Capacitor copia el contenido de `dist/` al shell
 * nativo (iOS o Android) para empaquetarlo.
 *
 * Los shells nativos NO se generan automáticamente. Cuando los
 * necesites:
 *
 *   pnpm cap:add:android   # genera apps/km0lab/android/
 *   pnpm cap:add:ios       # genera apps/km0lab/ios/  (requiere Mac)
 *
 * Después de cada cambio en la web:
 *
 *   pnpm build && pnpm cap:sync
 *   pnpm cap:open:android  # abre Android Studio
 *   pnpm cap:open:ios      # abre Xcode (requiere Mac)
 */
const config: CapacitorConfig = {
  appId: 'com.km0lab.app',
  appName: 'KM0 LAB',
  webDir: 'dist',
  android: {
    backgroundColor: '#FFECD2',
  },
  ios: {
    backgroundColor: '#FFECD2',
  },
}

export default config
