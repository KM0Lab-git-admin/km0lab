import { persistPendingInvite, resolveInviteCode, t } from '@km0lab/app'
import { Loader2 } from 'lucide-react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import BrandedFrame from '@/components/BrandedFrame'
import { useLang } from '@/contexts/LangContext'

/**
 * Landing canónica `/i/:code`. Resuelve el código, persiste last-click
 * y redirige a home (persona) o alta de comercio.
 */
const InviteLanding = () => {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const [failed, setFailed] = useState(false)
  const trimmed = code.trim().toLowerCase()
  const kindHint =
    searchParams.get('invite') === 'business' ? 'business' : 'person'

  useLayoutEffect(() => {
    if (!trimmed) return
    persistPendingInvite({ code: trimmed, kind: kindHint })
  }, [trimmed, kindHint])

  useEffect(() => {
    if (!trimmed) {
      navigate('/home', { replace: true })
      return
    }
    let cancelled = false
    resolveInviteCode(trimmed)
      .then((resolved) => {
        if (cancelled) return
        if (!resolved.valid || !resolved.code || !resolved.kind) {
          setFailed(true)
          return
        }
        persistPendingInvite({
          code: resolved.code,
          kind: resolved.kind,
          townId: resolved.town_id,
          townName: resolved.town_name,
        })
        const target =
          resolved.kind === 'business' ? '/business-signup' : '/home'
        navigate(target, { replace: true })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [trimmed, navigate])

  if (failed) {
    return (
      <BrandedFrame>
        <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
          <p className="font-body text-sm text-km0-coral-600">
            {t('invite.error.description', lang)}
          </p>
          <button
            type="button"
            onClick={() => navigate('/home', { replace: true })}
            className="mt-4 rounded-full bg-km0-blue-800 px-4 py-2 font-ui text-xs font-bold text-white"
          >
            {t('common.back', lang)}
          </button>
        </div>
      </BrandedFrame>
    )
  }

  return (
    <BrandedFrame>
      <div className="flex min-h-full items-center justify-center">
        <Loader2
          className="animate-spin text-km0-blue-700"
          aria-label={t('common.loading', lang)}
        />
      </div>
    </BrandedFrame>
  )
}

export default InviteLanding
