/*
 * Viene del prototipo (encargo 14b/14c) y la importa solo `Login.tsx`, que es
 * de producción: se copia a mano y queda con candado. Cambios respecto al
 * prototipo (hasta feaf75e, con la fila de iconos): solo las rutas de importación.
 */
import { t, useAccessConsent } from '@km0lab/app'
import { Button } from '@km0lab/ui'

import type { SocialNoticeValue } from '@/components/SocialSignInButton'
import type { AccessProvider, Lang } from '@km0lab/app'
import type { ReactNode } from 'react'

import AccessConsent from '@/components/AccessConsent'
import AccessProviderDoors from '@/components/AccessProviderDoors'

export interface AccessDoorChoiceProps {
  lang: Lang
  providers: AccessProvider[]
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
  termsHref: string
  privacyHref: string
  busyProvider: AccessProvider | null
  notice: SocialNoticeValue | null
  onEmail: () => void
  onProvider: (provider: AccessProvider) => void
  banner?: ReactNode
  invite: ReactNode
}

const AccessDoorChoice = ({
  lang,
  providers,
  termsAccepted,
  onTermsChange,
  termsHref,
  privacyHref,
  busyProvider,
  notice,
  onEmail,
  onProvider,
  banner,
  invite,
}: AccessDoorChoiceProps) => {
  const consent = useAccessConsent(termsAccepted)
  return (
    <div className="flex flex-col gap-2">
      {banner}
      <h1 className="text-center font-brand text-xl text-km0-blue-700">
        {t('login.title', lang)}
      </h1>
      <AccessConsent
        lang={lang}
        accepted={termsAccepted}
        onChange={(accepted) => {
          onTermsChange(accepted)
          if (accepted) consent.clearError()
        }}
        termsHref={termsHref}
        privacyHref={privacyHref}
        error={consent.error}
        checkboxRef={consent.checkboxRef}
      />
      <Button
        type="button"
        variant="bubbleSurface"
        onClick={consent.guard(onEmail)}
        disabled={busyProvider !== null}
        aria-disabled={!termsAccepted || undefined}
        className="h-12 w-full shrink-0 rounded-xl bg-km0-yellow-500 font-ui text-base text-km0-blue-700 hover:bg-km0-yellow-600 disabled:opacity-60"
      >
        {t('access.email.cta', lang)}
      </Button>
      <AccessProviderDoors
        lang={lang}
        providers={providers}
        busyProvider={busyProvider}
        ariaDisabled={!termsAccepted}
        iconOnly
        onProvider={(provider) => consent.guard(() => onProvider(provider))()}
        notice={notice}
      />
      {invite}
    </div>
  )
}
export default AccessDoorChoice
