/*
 * Viene del prototipo (encargo 14b/14c) y la importa solo `Login.tsx`, que es
 * de producción: se copia a mano y queda con candado. Cambios respecto al
 * prototipo: solo las rutas de importación.
 */
import { networkName, t, tf, type Lang } from '@km0lab/app'
import { Button } from '@km0lab/ui'

import type { AccessProvider } from '@km0lab/app'
import type { FocusEvent, FormEvent } from 'react'

import SocialSignInButton, {
  SocialNotice,
  type SocialNoticeValue,
} from '@/components/SocialSignInButton'

export type AccessEmailError =
  | 'required'
  | 'invalid'
  | 'send_failed'
  | 'ip_limited'
  | 'offline'

export interface AccessEmailFormProps {
  lang: Lang
  email: string
  onEmailChange: (email: string) => void
  sending: boolean
  error: AccessEmailError | null
  onSubmit: () => void
  onChangeMethod: () => void
  /** Offered when this connection made too many attempts. */
  providers: AccessProvider[]
  busyProvider: AccessProvider | null
  socialNotice: SocialNoticeValue | null
  onProvider: (provider: AccessProvider) => void
}

const ERROR_KEY = {
  required: 'login.error_email',
  invalid: 'access.email.invalid',
  send_failed: 'access.email.send_failed',
  ip_limited: 'access.email.ip_limited',
  offline: 'access.offline',
} as const

const revealOnFocus = (event: FocusEvent<HTMLElement>) => {
  event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/** Step 2 of access: the email door. The submit button lives in a fixed footer. */
const AccessEmailForm = ({
  lang,
  email,
  onEmailChange,
  sending,
  error,
  onSubmit,
  onChangeMethod,
  providers,
  busyProvider,
  socialNotice,
  onProvider,
}: AccessEmailFormProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }
  const showSocial = error === 'ip_limited' && providers.length > 0

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="my-auto flex flex-col gap-3 py-1">
          <div className="space-y-1 text-center">
            <h1 className="font-brand text-xl text-km0-blue-700">
              {t('access.email.title', lang)}
            </h1>
          </div>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            onFocus={revealOnFocus}
            placeholder={t('login.email_placeholder', lang)}
            aria-label={t('account.sheet.email', lang)}
            aria-invalid={
              error === 'invalid' || error === 'required' || undefined
            }
            autoComplete="email"
            inputMode="email"
            className="h-12 shrink-0 rounded-xl border-2 border-km0-blue-700/20 bg-background px-4 font-body text-base text-foreground transition-colors placeholder:text-muted-foreground focus:border-km0-blue-700 focus:outline-none"
          />
          {error && (
            <p
              role="alert"
              className="font-body text-xs leading-snug text-destructive"
            >
              {t(ERROR_KEY[error], lang)}
            </p>
          )}
          {showSocial && (
            <div className="flex flex-col gap-2">
              {providers.map((provider) => (
                <SocialSignInButton
                  key={provider}
                  provider={provider}
                  label={tf('access.social.continue', lang, {
                    network: networkName(provider, lang),
                  })}
                  loading={busyProvider === provider}
                  disabled={busyProvider !== null && busyProvider !== provider}
                  onClick={() => onProvider(provider)}
                />
              ))}
              {socialNotice && <SocialNotice notice={socialNotice} />}
            </div>
          )}
          <Button
            type="button"
            variant="bubbleLink"
            onClick={onChangeMethod}
            className="self-center text-sm underline underline-offset-2"
          >
            {t('access.email.change', lang)}
          </Button>
        </div>
      </div>
      <div className="shrink-0 pt-3">
        <Button
          type="submit"
          variant="bubbleSurface"
          disabled={sending}
          className="h-12 w-full rounded-xl bg-km0-yellow-500 font-ui text-base text-km0-blue-700 hover:bg-km0-yellow-600 disabled:opacity-50"
        >
          {sending ? t('login.submitting', lang) : t('login.submit', lang)}
        </Button>
      </div>
    </form>
  )
}

export default AccessEmailForm
