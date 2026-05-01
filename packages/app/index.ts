/**
 * @km0lab/app — punto de entrada público del paquete.
 *
 * Re-exporta todo lo que viene de hooks/, services/, utils/, data/ y types/.
 * Los consumidores (apps/*, packages/components/*) importan siempre desde
 * '@km0lab/app', nunca desde rutas internas.
 */

export * from './hooks'
export * from './services'
export * from './utils'
export * from './data'
export * from './types'
