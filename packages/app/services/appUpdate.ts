/**
 * appUpdate — «esta app es demasiado antigua para el servidor».
 *
 * La app nativa se publica menos a menudo que la API. Cuando el servidor
 * deja de admitir una versión, contesta 426 con `app_update_required`. El
 * cliente lo apunta aquí y la app enseña la pantalla de «actualiza» en vez
 * de fallar sin explicación. No se guarda: se vuelve a comprobar al abrir.
 */
type Listener = () => void

export type UpdateRequired = { minVersion: string } | null

let state: UpdateRequired = null
const listeners = new Set<Listener>()

export const UPDATE_REQUIRED_CODE = 'app_update_required'

export const getUpdateRequired = (): UpdateRequired => state

export const subscribeUpdateRequired = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const markUpdateRequired = (minVersion: string): void => {
  if (state?.minVersion === minVersion) return
  state = { minVersion }
  for (const listener of listeners) listener()
}

/** Solo para pruebas. */
export const resetUpdateRequired = (): void => {
  state = null
  for (const listener of listeners) listener()
}
