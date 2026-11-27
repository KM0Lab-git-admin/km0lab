/**
 * Demostración: qué se ve según la población elegida.
 *
 * Quien teclea 00000 elige una población o una agrupación de la lista. La
 * cuenta, los puntos, los comercios y los premios son siempre los de Demo
 * KM0 (datos de mentira, aparte de cualquier pueblo real); lo que cambia con
 * la elección es lo que se ve del pueblo: su nombre, su ilustración, su
 * agenda y sus noticias. Estas funciones convierten la elección guardada en
 * el «territorio» que ya entienden las pantallas.
 */
import type { Territory, Town, TownChoice } from '../types/territory'

const byName = (a: Town, b: Town) => a.name.localeCompare(b.name, 'ca')

/** La población de referencia: la elegida dentro de la agrupación, o la primera. */
export function showcaseHomeTown(
  choice: TownChoice | null,
  homeTownId: string | null
): Town | null {
  if (!choice || choice.towns.length === 0) return null
  const home =
    choice.towns.find((town) => town.id === homeTownId) ?? choice.towns[0]
  return home ?? null
}

/** El territorio que se ve en la demostración, o null fuera de ella. */
export function showcaseTerritory(
  choice: TownChoice | null,
  homeTownId: string | null
): Territory | null {
  const home = showcaseHomeTown(choice, homeTownId)
  if (!choice || !home) return null
  const others = choice.towns.filter((town) => town.id !== home.id).sort(byName)
  return {
    scopeId: `showcase-${choice.id}`,
    scopeName: choice.name,
    homeTownId: home.id,
    towns: [home, ...others],
  }
}
