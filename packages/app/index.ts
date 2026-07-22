/**
 * @km0lab/app — punto de entrada público del paquete.
 *
 * Re-exporta todo lo que viene de hooks/, services/, utils/, data/, types/
 * y design-system/. Los consumidores (apps/*, packages/components/*)
 * importan siempre desde '@km0lab/app', nunca desde rutas internas.
 */

export * from './hooks'
export * from './services'
export * from './stores'
export * from './machines'
export * from './utils'
export * from './data'
export * from './types'
// El design-system se expone bajo namespace para no colisionar con nombres
// de runtime (p. ej. `Breakpoint`). Consumir como `designSystem.X`.
export * as designSystem from './design-system'
