/// <reference types="vite/client" />

/**
 * Lovable no versiona algunos assets como binario, sino como puntero
 * `<nombre>.<ext>.asset.json` hacia su CDN, y el código portado lo importa y
 * lee `.url`. En producción el plugin `km0lab:lovable-asset-pointer` de
 * `vite.config.ts` sirve la misma forma apuntando al binario local.
 */
declare module '*.asset.json' {
  export const url: string
  const pointer: { url: string }
  export default pointer
}
