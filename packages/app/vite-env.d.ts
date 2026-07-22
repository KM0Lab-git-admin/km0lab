/**
 * Tipos de las variables de entorno de Vite consumidas por @km0lab/app.
 *
 * @km0lab/app no incluye `vite/client` en su tsconfig (es una librería), así
 * que declaramos aquí la forma de import.meta.env que usa utils/env.ts. Debe
 * mantenerse en sintonía con las claves VITE_ de apps/km0lab/env/.env.*.
 */
interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_KM0LAB_API_URL: string
  readonly VITE_EVENTS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
