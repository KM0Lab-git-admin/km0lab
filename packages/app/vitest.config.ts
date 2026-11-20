import { defineConfig } from 'vitest/config'

/**
 * Pruebas rápidas de la lógica de la app: sin navegador y sin servidor.
 * Tardan un par de segundos y corren solas al subir (`lefthook pre-push`).
 * Los recorridos con navegador viven en `packages/e2e`.
 */
export default defineConfig({
  mode: 'development',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
    env: {
      VITE_KM0LAB_API_URL: 'http://api.test',
      VITE_EVENTS_API_URL: 'http://events.test',
      VITE_PUBLIC_APP_URL: 'http://app.test',
      VITE_ANDROID_STORE_URL: 'http://store.test/app',
      VITE_IOS_STORE_URL: '',
    },
  },
})
