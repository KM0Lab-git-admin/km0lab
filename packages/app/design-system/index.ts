/**
 * @km0lab/app — design-system
 *
 * Source of truth declarativa de los tokens del sistema KM0 LAB
 * (colores, tipografía, spacing, radios, breakpoints, animaciones,
 * iconografía) y generador del prompt para IAs externas.
 *
 * Mantenido en sync con apps/km0lab/tailwind.config.js y
 * apps/km0lab/styles/global.css. Si cambias un token aquí, cambia
 * los otros dos también (o viceversa).
 */

export * from './tokens'
export * from './aiContext'
export * from './componentsCatalog'
export * from './viewports'
// tokens y componentsCatalog exportan sendos tipos `Breakpoint`
// equivalentes; se fija el de tokens como canónico del barrel.
export type { Breakpoint } from './tokens'
