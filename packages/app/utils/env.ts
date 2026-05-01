import { z } from 'zod'

/**
 * Schema de variables de entorno expuestas al cliente.
 *
 * En Expo solo las variables prefijadas con EXPO_PUBLIC_ están disponibles
 * en runtime; el resto vive solo en build. APP_ENV se carga via dotenv-cli
 * desde apps/km0lab/env/.env.{development,production}.
 *
 * Cualquier env nueva debe añadirse aquí. Si falta una env requerida o
 * tiene formato incorrecto, parse() lanza al inicio de la app, evitando
 * errores silenciosos en runtime.
 */
const envSchema = z.object({
  APP_ENV: z.enum(['development', 'production']),
  EXPO_PUBLIC_API_URL: z.string().url(),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse({
  APP_ENV: process.env.APP_ENV,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
})
