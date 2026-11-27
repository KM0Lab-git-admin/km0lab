/**
 * accountEvents — aviso mínimo de «la cuenta del usuario ha cambiado».
 *
 * Canjear un premio o escanear un QR cambia saldo, historial y canjes en el
 * servidor. Los servicios que lo provocan llaman a `notifyAccountChanged` y
 * `useAccount` vuelve a pedir los datos. No guarda estado.
 */
type Listener = () => void

const listeners = new Set<Listener>()

export const onAccountChanged = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const notifyAccountChanged = (): void => {
  for (const listener of listeners) listener()
}
