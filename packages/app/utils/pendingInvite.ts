import { useAppStore, type PendingInvite } from '../stores/useAppStore'

const COOKIE = 'km0_invite'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export const writeInviteCookie = (code: string): void => {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export const readInviteCookie = (): string | null => {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=')
    if (rawKey === COOKIE) {
      const value = decodeURIComponent(rest.join('='))
      return value || null
    }
  }
  return null
}

export const clearInviteCookie = (): void => {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export const persistPendingInvite = (invite: PendingInvite): void => {
  useAppStore.getState().setPendingInvite(invite)
  writeInviteCookie(invite.code)
}

export const clearPendingInvite = (): void => {
  useAppStore.getState().setPendingInvite(null)
  clearInviteCookie()
}

export const currentInviteCode = (): string | null => {
  const pending = useAppStore.getState().pendingInvite
  return pending?.code ?? readInviteCookie()
}

/** Extrae el código de /i/:code, hash nativo o query legacy `ref`. */
export const extractInviteCodeFromUrl = (raw: string): string | null => {
  try {
    const url = new URL(raw)
    const fromQuery =
      url.searchParams.get('ref') || url.searchParams.get('invite_code')
    const path = `${url.pathname}${url.hash}`
    const match = path.match(/\/i\/([a-z0-9]{6,32})/i)
    return (match?.[1] || fromQuery || '').trim().toLowerCase() || null
  } catch {
    const match = raw.match(/\/i\/([a-z0-9]{6,32})/i)
    return match?.[1]?.toLowerCase() ?? null
  }
}
