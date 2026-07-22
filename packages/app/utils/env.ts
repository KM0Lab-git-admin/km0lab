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
const envSchema = z.object({
  MODE: z.enum(['development', 'production']),
  VITE_KM0LAB_API_URL: z.string().url(),
  VITE_EVENTS_API_URL: z.string().url(),
})

const parsed = envSchema.parse({
  MODE: import.meta.env.MODE,
  VITE_KM0LAB_API_URL: import.meta.env.VITE_KM0LAB_API_URL,
  VITE_EVENTS_API_URL: import.meta.env.VITE_EVENTS_API_URL,
})

export const env = {
  appEnv: parsed.MODE,
  km0labApiUrl: parsed.VITE_KM0LAB_API_URL,
  eventsApiUrl: parsed.VITE_EVENTS_API_URL,
} as const

export type Env = typeof env
