/**
 * Versión de la app, tal como la ve el código.
 *
 * La fuente única es el fichero `VERSION` de la raíz del repositorio. Vite
 * la inyecta al compilar (ver `apps/km0lab/vite.config.ts`), junto con el
 * commit del que sale la compilación. Detalle en `docs/VERSIONES.md`.
 */
import { Capacitor } from '@capacitor/core'

declare const __APP_VERSION__: string | undefined
declare const __APP_COMMIT__: string | undefined

/** Versión publicada, `1.2.0`. En pruebas sin compilar vale `0.0.0`. */
export const APP_VERSION: string =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0'

/** Commit del que se compiló, o cadena vacía en local. */
export const APP_COMMIT: string =
  typeof __APP_COMMIT__ === 'string' ? __APP_COMMIT__ : ''

export type AppPlatform = 'web' | 'android' | 'ios'

export const appPlatform = (): AppPlatform => {
  const platform = Capacitor.getPlatform()
  return platform === 'android' || platform === 'ios' ? platform : 'web'
}

/** `1.2.0` → [1, 2, 0]. Devuelve null si no son tres números. */
export const parseVersion = (
  value: string
): [number, number, number] | null => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.trim())
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/** Negativo si `a` es anterior a `b`, 0 si son la misma, positivo si no. */
export const compareVersions = (a: string, b: string): number => {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (!pa || !pb) return 0
  for (let i = 0; i < 3; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** Lo que se enseña a una persona: `1.2.0` o `1.2.0 · abc1234`. */
export const appVersionLabel = (): string =>
  APP_COMMIT ? `${APP_VERSION} · ${APP_COMMIT.slice(0, 7)}` : APP_VERSION
