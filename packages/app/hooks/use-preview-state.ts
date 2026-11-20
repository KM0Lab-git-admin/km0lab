export type ScreenState = 'loading' | 'empty' | 'error' | 'ready'

/**
 * usePreviewState — estado de pantalla a partir de la carga real.
 *
 * Costura con Lovable. Allí además permite forzar estados con `?state=`
 * para revisar la maqueta; en producción el estado sale solo de los datos.
 */
export function usePreviewState(
  loading: boolean,
  error: boolean,
  empty: boolean
): { state: ScreenState; retry: (reload: () => void) => void } {
  const state: ScreenState = loading
    ? 'loading'
    : error
      ? 'error'
      : empty
        ? 'empty'
        : 'ready'
  return { state, retry: (reload) => reload() }
}
