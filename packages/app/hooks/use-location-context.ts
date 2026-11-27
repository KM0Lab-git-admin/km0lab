import { useAppStore } from '../stores/useAppStore'
import { showcaseHomeTown } from '../utils/showcase'

/**
 * useLocationContext — municipio elegido por el vecino.
 *
 * Costura con Lovable. Devuelve lo que hay en el store real (lo escribe la
 * pantalla de código postal con `setLocation`). `town` es el nombre que se
 * enseña; la traducción «municipio de demostración → contenido de Malgrat»
 * la hacen los servicios de contenido (`municipalListings`), no las
 * pantallas.
 *
 * En la demostración el código postal sigue siendo el de Demo KM0 (de él
 * cuelgan la cuenta, los comercios y los premios), pero el nombre es el de
 * la población elegida en la lista.
 */
export function useLocationContext(): { postalCode: string; town: string } {
  const postalCode = useAppStore((s) => s.postalCode)
  const town = useAppStore((s) => s.town)
  const choice = useAppStore((s) => s.showcaseChoice)
  const homeTownId = useAppStore((s) => s.showcaseHomeTownId)
  const shown = showcaseHomeTown(choice, homeTownId)?.name ?? town
  return { postalCode: postalCode ?? '', town: shown ?? '' }
}
