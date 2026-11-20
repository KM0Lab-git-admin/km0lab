/**
 * Los textos de las pruebas salen del mismo diccionario que usa la app.
 * Una prueba busca «el botón que se llama `home.login_cta`», no «el tercer
 * botón»: un rediseño de Lovable no la rompe, y un cambio de texto tampoco.
 */
import { t, type Lang, type TKey } from '../../app/utils/i18nProd'

export type { Lang, TKey }

export const LANGS: Lang[] = ['ca', 'es', 'en']

/** Traductor fijado a un idioma. */
export const translator = (lang: Lang) => (key: TKey) => t(key, lang)

export type Translate = ReturnType<typeof translator>

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Coincidencia exacta, sin distinguir mayúsculas ni espacios de borde. */
export const exactly = (text: string) =>
  new RegExp(`^\\s*${escape(text)}\\s*$`, 'i')

/** El texto aparece dentro del nombre (botones con icono, contador…). */
export const containing = (text: string) => new RegExp(escape(text), 'i')
