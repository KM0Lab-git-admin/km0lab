/**
 * El testigo de «falta tu correo». De producción (candado en el manifest).
 *
 * Cuando una red no da un correo de fiar, la API contesta `email_missing`
 * con un testigo de 15 minutos. Se guarda aquí mientras la persona escribe y
 * confirma un correo con el código; `verifyOtp` lo manda con el código y la
 * red queda enlazada a esa cuenta. Solo dura la pestaña.
 */
const KEY = 'km0_pending_link_token'

export const pendingLinkToken = (): string | null => {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const stashLinkToken = (token: string): void => {
  try {
    sessionStorage.setItem(KEY, token)
  } catch {
    // Sin almacenamiento la red no se enlaza; la cuenta se crea igual.
  }
}

export const clearPendingLinkToken = (): void => {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Nada que borrar.
  }
}
