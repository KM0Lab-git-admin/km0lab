import type {
  AccessError,
  AccessProvider,
  AccountAccessTarget,
} from '@km0lab/app'
import {
  useAccessDoors,
  useAccessConsent,
  getAccessNotice,
  isEmailFormat,
  t,
  tf,
  networkName,
  type Lang,
} from '@km0lab/app'
import { Button, Input, Label } from '@km0lab/ui'
import { Lock, Loader2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import AccessConsent from '@/components/AccessConsent'
import AccessProviderDoors from '@/components/AccessProviderDoors'
import BubbleSheet from '@/components/BubbleSheet'
import EmailRequestStep from '@/components/EmailRequestStep'
import InviteCodeField from '@/components/InviteCodeField'
import PilotFullNotice from '@/components/PilotFullNotice'
import { LEGAL_ROUTES } from '@/data/legalRoutes'
import { cn } from '@/lib/utils'

interface AccountAccessSheetProps {
  target: AccountAccessTarget | null
  lang: Lang
  container: HTMLElement | null
  submitting: boolean
  error: string | null
  busyProvider: AccessProvider | null
  socialError: { provider: AccessProvider; error: AccessError } | null
  pilotFull: boolean
  emailRequestProvider: AccessProvider | null
  onBackToDoors: () => void
  onClose: () => void
  onContinue: (email: string, referralReference?: string | null) => void
  onProvider: (
    provider: AccessProvider,
    referralReference: string | null
  ) => void
  onLogin: () => void
  onExplore: () => void
}

const AccountAccessSheet = ({
  target,
  lang,
  container,
  submitting,
  error,
  busyProvider,
  socialError,
  pilotFull,
  emailRequestProvider,
  onBackToDoors,
  onClose,
  onContinue,
  onProvider,
  onLogin,
  onExplore,
}: AccountAccessSheetProps) => {
  const [email, setEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [params] = useSearchParams()
  const reference = params.get('ref')
  const [inviteCode, setInviteCode] = useState(reference ?? '')
  const { providers } = useAccessDoors()
  const consent = useAccessConsent(termsAccepted)
  const emailRef = useRef<HTMLInputElement>(null)
  const formId = useId()
  const busy = submitting || busyProvider !== null
  const referralReference = inviteCode.trim() || reference
  const showEmail = () => {
    emailRef.current?.scrollIntoView({ block: 'center' })
    emailRef.current?.focus()
  }
  const submitEmail = () => {
    if (!email.trim() || !isEmailFormat(email.trim())) {
      setEmailError(
        t(email.trim() ? 'access.email.invalid' : 'login.error_email', lang)
      )
      showEmail()
      return
    }
    if (!busy) onContinue(email.trim(), referralReference)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    consent.guard(submitEmail)()
  }
  return (
    <BubbleSheet
      open={target !== null}
      onClose={onClose}
      title={t('account.sheet.title', lang)}
      lang={lang}
      container={container}
      footer={
        <>
          {!pilotFull && (
            <Button
              form={formId}
              variant="bubblePrimary"
              type="submit"
              disabled={busy}
              aria-disabled={!termsAccepted || undefined}
              className={cn('h-12 min-h-12 w-full')}
            >
              {submitting && <Loader2 aria-hidden className="animate-spin" />}
              {t(
                submitting
                  ? 'login.submitting'
                  : emailRequestProvider
                    ? 'login.submit'
                    : 'access.email.cta',
                lang
              )}
            </Button>
          )}
        </>
      }
    >
      {pilotFull ? (
        <PilotFullNotice
          title={t('pilot.full.title', lang)}
          description={t('pilot.full.description', lang)}
          exploreLabel={t('pilot.full.explore', lang)}
          backLabel={t('common.back', lang)}
          onExplore={onExplore}
          onBack={onClose}
        />
      ) : emailRequestProvider ? (
        <EmailRequestStep
          formId={formId}
          title={t('access.email_request.title', lang)}
          reason={tf('access.email_request.reason', lang, {
            network: networkName(emailRequestProvider, lang),
          })}
          emailLabel={t('account.sheet.email', lang)}
          placeholder={t('login.email_placeholder', lang)}
          backLabel={t('access.email_request.back', lang)}
          email={email}
          error={error ?? emailError}
          submitting={submitting}
          onEmailChange={(value) => {
            setEmail(value)
            setEmailError(null)
          }}
          onSubmit={submitEmail}
          onBack={() => {
            setEmailError(null)
            onBackToDoors()
          }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-ui text-xs font-bold leading-5 text-km0-teal-800">
            <Lock aria-hidden className="h-4 w-4 shrink-0" />
            {t(
              target === 'profile'
                ? 'account.sheet.profile'
                : target === 'rewards'
                  ? 'account.sheet.rewards'
                  : 'account.sheet.points',
              lang
            )}
          </p>
          <AccessConsent
            lang={lang}
            accepted={termsAccepted}
            onChange={(accepted) => {
              setTermsAccepted(accepted)
              if (accepted) consent.clearError()
            }}
            termsHref={LEGAL_ROUTES.terms}
            privacyHref={LEGAL_ROUTES.privacy}
            error={consent.error}
            checkboxRef={consent.checkboxRef}
          />
          <form
            id={formId}
            onSubmit={submit}
            noValidate
            className="flex flex-col gap-2"
          >
            <Label
              htmlFor={`${formId}-email`}
              className="font-ui font-bold text-km0-blue-800"
            >
              {t('account.sheet.email', lang)}
            </Label>
            <Input
              ref={emailRef}
              id={`${formId}-email`}
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError(null)
              }}
              placeholder={t('login.email_placeholder', lang)}
              className="h-14 rounded-2xl border-2 border-km0-blue-700 bg-card px-4 text-base text-km0-blue-800"
            />
            {(error || emailError) && (
              <p role="alert" className="font-ui text-sm text-destructive">
                {error ?? emailError}
              </p>
            )}
          </form>
          <AccessProviderDoors
            lang={lang}
            providers={providers}
            busyProvider={busyProvider}
            disabled={submitting}
            ariaDisabled={!termsAccepted}
            iconOnly
            onProvider={(provider) =>
              consent.guard(() => onProvider(provider, referralReference))()
            }
            notice={
              socialError
                ? getAccessNotice(socialError.provider, socialError.error, lang)
                : null
            }
          />
          <InviteCodeField
            value={inviteCode}
            onChange={setInviteCode}
            initiallyOpen={Boolean(reference)}
            toggleLabel={t('login.invite.toggle', lang)}
            label={t('login.invite.label', lang)}
          />
          <Button
            variant="bubbleLink"
            onClick={onLogin}
            disabled={busy}
            className="h-auto whitespace-normal text-center underline underline-offset-4"
          >
            {t('account.sheet.login', lang)}
          </Button>
        </div>
      )}
    </BubbleSheet>
  )
}
export default AccountAccessSheet
