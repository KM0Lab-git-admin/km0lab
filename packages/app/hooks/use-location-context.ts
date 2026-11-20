import { useAppStore } from '../stores/useAppStore'

/**
 * useLocationContext — municipio elegido por el vecino.
 *
 * Costura con Lovable. Devuelve lo que hay en el store real (lo escribe la
 * pantalla de código postal con `setLocation`). `town` es el nombre que se
 * enseña; la traducción «municipio de demostración → contenido de Malgrat»
 * la hacen los servicios de contenido (`municipalListings`), no las
 * pantallas.
 */
export function useLocationContext(): { postalCode: string; town: string } {
  const postalCode = useAppStore((s) => s.postalCode)
  const town = useAppStore((s) => s.town)
  return { postalCode: postalCode ?? '', town: town ?? '' }
}
