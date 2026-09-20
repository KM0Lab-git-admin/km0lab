import { extractInviteCodeFromUrl, persistPendingInvite } from '@km0lab/app'
import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Persiste el código de invitación en cuanto aparece en la URL, antes de que
 * RequireSetup redirija a idioma / CP y desmonte `/i/:code`.
 */
export default function CaptureInviteFromUrl() {
  const location = useLocation()

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const href = `${window.location.origin}${location.pathname}${location.search}${location.hash}`
    const code = extractInviteCodeFromUrl(href)
    if (!code) return
    const params = new URLSearchParams(location.search)
    const kind = params.get('invite') === 'business' ? 'business' : 'person'
    persistPendingInvite({ code, kind })
  }, [location.pathname, location.search, location.hash])

  return null
}
