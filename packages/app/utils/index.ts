/**
 * @km0lab/app — utils
 *
 * Helpers puros y módulos de configuración que no dependen del framework
 * (formatDate, buildQuery, env validado…).
 */

export * from './env'
export * from './i18n'

// `t` y `TKey` se reexportan desde el overlay de produccion (i18nProd), que
// fusiona el diccionario de Lovable con las claves propias de produccion. El
// re-export explicito tiene precedencia sobre el `export *` de arriba.
// OJO: no borres la linea `export * from './i18n'` — sync-lovable.mjs la
// volveria a anadir automaticamente (ensureBarrelExport).
export { t, type TKey } from './i18nProd'
export type { TKeyProd } from './i18nProd'
export * from './postalCodes'
export * from './demoTown'
export * from './shopPromotionMapper'
export * from './pointActionMapper'
export * from './pointsHistoryMapper'
export * from './redemptionMapper'
export * from './openingHours'
export * from './shopMapper'
export * from './shopCategoryEmoji'
export * from './qr'
