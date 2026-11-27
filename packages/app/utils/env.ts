import { z } from 'zod'

/**
 * Schema de variables de entorno expuestas al cliente.
 *
 * Vite solo expone al cliente las variables con prefijo VITE_ (via
 * import.meta.env). Se cargan desde apps/km0lab/env/.env.{development,production}
 * mediante dotenv-cli. El entorno activo se deriva de import.meta.env.MODE.
 *
 * Cualquier env nueva debe añadirse aquí. Si falta una env requerida o tiene
 * formato incorrecto, parse() lanza al inicio de la app, evitando errores
 * silenciosos en runtime.
 */
const emptyToUndefined = (value: unknown): unknown =>
  value === '' || value === undefined ? undefined : value

const envSchema = z.object({
  MODE: z.enum(['development', 'production']),
  VITE_KM0LAB_API_URL: z.string().url(),
  VITE_EVENTS_API_URL: z.string().url(),
  VITE_PUBLIC_APP_URL: z.string().url(),
  VITE_ANDROID_STORE_URL: z.string().url(),
  VITE_IOS_STORE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional()
  ),
})

const parsed = envSchema.parse({
  MODE: import.meta.env.MODE,
  VITE_KM0LAB_API_URL: import.meta.env.VITE_KM0LAB_API_URL,
  VITE_EVENTS_API_URL: import.meta.env.VITE_EVENTS_API_URL,
  VITE_PUBLIC_APP_URL: import.meta.env.VITE_PUBLIC_APP_URL,
  VITE_ANDROID_STORE_URL: import.meta.env.VITE_ANDROID_STORE_URL,
  VITE_IOS_STORE_URL: import.meta.env.VITE_IOS_STORE_URL,
})

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

export const env = {
  appEnv: parsed.MODE,
  km0labApiUrl: parsed.VITE_KM0LAB_API_URL,
  eventsApiUrl: parsed.VITE_EVENTS_API_URL,
  publicAppUrl: stripTrailingSlash(parsed.VITE_PUBLIC_APP_URL),
  androidStoreUrl: parsed.VITE_ANDROID_STORE_URL,
  iosStoreUrl: parsed.VITE_IOS_STORE_URL
    ? stripTrailingSlash(parsed.VITE_IOS_STORE_URL)
    : undefined,
} as const

/** Preview de diseño: solo hostname local, nunca UAT/producción. */
export const isLocalhostApp = (): boolean => {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

export type Env = typeof env
