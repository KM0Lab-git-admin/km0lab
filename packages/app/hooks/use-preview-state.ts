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
): {
  state: ScreenState
  retry: (reload: () => void) => void
  isSample: boolean
} {
  const state: ScreenState = loading
    ? 'loading'
    : error
      ? 'error'
      : empty
        ? 'empty'
        : 'ready'
  return { state, retry: (reload) => reload(), isSample: false }
}

/**
 * En Lovable `?state=sample` enseña contenido de muestra. En producción no
 * existe: la fuente es siempre la real, y los enlaces no arrastran nada.
 */
export type ContentSource = 'live' | 'sample'

export const getContentSource = (_state: string | null): ContentSource => 'live'

export function useContentSource(): ContentSource {
  return 'live'
}

export function getContentPath(path: string, _source?: ContentSource): string {
  return path
}
