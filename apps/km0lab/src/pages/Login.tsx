import {
  clearPendingReward,
  currentInviteCode,
  isEmailFormat,
  isPendingScanFresh,
  leaveDemo,
  loginWithProvider,
  getAccessNotice,
  networkName,
  readPendingReward,
  requestOtp,
  scannerPathFor,
  t,
  tf,
  useAccessDoors,
  useAppStore,
} from '@km0lab/app'
import { Button } from '@km0lab/ui'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import type { SocialNoticeValue } from '@/components/SocialSignInButton'
import type { AccessProvider } from '@km0lab/app'

import AccessDoorChoice from '@/components/AccessDoorChoice'
import AccessEmailForm, {
  type AccessEmailError,
} from '@/components/AccessEmailForm'
import BrandedFrame from '@/components/BrandedFrame'
import EmailRequestStep from '@/components/EmailRequestStep'
import InviteCodeField from '@/components/InviteCodeField'
import LeaveDemoSheet from '@/components/LeaveDemoSheet'
import PilotFullNotice from '@/components/PilotFullNotice'
import { useLang } from '@/contexts/LangContext'
import { LEGAL_ROUTES } from '@/data/legalRoutes'

type Step = 'choose' | 'email' | 'email-request'

const EMAIL_ERROR_KEYS = {
  required: 'login.error_email',
  invalid: 'access.email.invalid',
  send_failed: 'access.email.send_failed',
  ip_limited: 'access.email.ip_limited',
  offline: 'access.offline',
} as const

/**
 * Pantalla única de entrada (alta y acceso). De producción (candado).
 *
 * La estructura es la del prototipo (encargos 14, 14b y 14c): primero se
 * elige por dónde entrar (correo o una red), con la casilla de las
 * condiciones y el código de invitación; después el correo, o el paso «Un
 * darrer pas» si una red no dio un correo de fiar. Lo de producción:
 *
 * - Las redes que salen las dice el servidor (`useAccessDoors`). Sin ninguna
 *   encendida, solo el correo.
 * - Entrar con una red es como el código: si la cuenta es de demostración y
 *   se entró desde un pueblo real, se pregunta antes de moverla.
 * - Lo de siempre: el aviso de invitación aplicada o de visita pendiente, el
 *   aforo del piloto y adónde se vuelve después.
 */
const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const { providers } = useAccessDoors()
  const postalCode = useAppStore((s) => s.postalCode) ?? undefined
  const town = useAppStore((s) => s.town) ?? undefined
  const pendingInvite = useAppStore((s) => s.pendingInvite)
  const pendingScan = useAppStore((s) => s.pendingScan)
  const scanPending = isPendingScanFresh(pendingScan, Date.now())

  // El código de invitación llega con el enlace o lo escribe la persona: una
  // app recién instalada no recibe el enlace. El escrito gana al del enlace;
  // si vale o no lo decide el servidor.
  const linkInviteCode = currentInviteCode() ?? searchParams.get('ref')
  const [inviteCode, setInviteCode] = useState(linkInviteCode ?? '')

  const [step, setStep] = useState<Step>('choose')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [emailError, setEmailError] = useState<AccessEmailError | null>(null)
  const [busyProvider, setBusyProvider] = useState<AccessProvider | null>(null)
  const [socialNotice, setSocialNotice] = useState<SocialNoticeValue | null>(
    null
  )
  const [emailRequestProvider, setEmailRequestProvider] =
    useState<AccessProvider | null>(null)
  const [pilotFull, setPilotFull] = useState(false)
  const [leaving, setLeaving] = useState<{
    town: string
    postalCode: string
  } | null>(null)
  const [leaveBusy, setLeaveBusy] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  const referralReference =
    inviteCode.trim().toLowerCase() || linkInviteCode || null
  // `?returnTo=` o el destino que guardó RequireAuth al mandar aquí.
  const from = (
    location.state as { from?: { pathname?: string; search?: string } } | null
  )?.from
  const fromPath = from?.pathname
    ? `${from.pathname}${from.search ?? ''}`
    : null
  const returnTo =
    searchParams.get('returnTo') ??
    fromPath ??
    (pendingInvite?.kind === 'business' ? '/business-signup' : null)

  const goToEmail = () => {
    setSocialNotice(null)
    setStep('email')
  }

  /** Lo que sigue a entrar con una red: lo mismo que tras el código. */
  const finishLogin = () => {
    const rewarded = readPendingReward() !== null
    clearPendingReward()
    const scan = useAppStore.getState().pendingScan
    const scanPath = isPendingScanFresh(scan, Date.now())
      ? scannerPathFor(scan.code)
      : null
    const safeReturnTo =
      scanPath ??
      (returnTo?.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : rewarded
          ? '/home?welcome=1'
          : '/home')
    navigate(safeReturnTo, { replace: true })
  }

  const handleProvider = async (provider: AccessProvider) => {
    setSocialNotice(null)
    setBusyProvider(provider)
    const { error, cancelled, notice } = await loginWithProvider(provider, {
      referralReference,
    })
    setBusyProvider(null)
    if (cancelled) return
    if (error?.code === 'pilot_full') {
      setPilotFull(true)
      return
    }
    if (error?.code === 'email_missing') {
      // El camino normal con Facebook: la persona confirma un correo.
      setEmailError(null)
      setEmailRequestProvider(provider)
      setStep('email-request')
      return
    }
    if (error) {
      setSocialNotice(getAccessNotice(provider, error, lang))
      return
    }
    toast.success(t('otp.welcome', lang))
    if (notice?.kind === 'account_is_real') {
      toast.info(
        t('demo.notice.account_is_real', lang).replace('{town}', notice.town),
        { duration: 12000 }
      )
    }
    if (notice?.kind === 'confirm_leave_demo') {
      setLeaving({ town: notice.town, postalCode: notice.postalCode })
      return
    }
    finishLogin()
  }

  const handleEmailSubmit = async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setEmailError('required')
      return
    }
    if (!isEmailFormat(trimmed)) {
      setEmailError('invalid')
      return
    }
    setEmailError(null)
    setSending(true)
    const { error } = await requestOtp(trimmed, {
      postal_code: postalCode,
      town,
      invite_code: referralReference ?? undefined,
    })
    setSending(false)
    if (error?.code === 'pilot_full') {
      setPilotFull(true)
      return
    }
    if (error?.code === 'ip_limited') {
      setEmailError('ip_limited')
      return
    }
    if (error?.code === 'offline') {
      setEmailError('offline')
      return
    }
    if (error) {
      setEmailError('send_failed')
      return
    }
    toast.success(t('login.toast_sent', lang))
    navigate('/check-email', {
      state: { email: trimmed, mode: 'login', returnTo, referralReference },
    })
  }

  const back = () => {
    if (step !== 'choose') {
      setEmailError(null)
      setSocialNotice(null)
      setEmailRequestProvider(null)
      setStep('choose')
      return
    }
    navigate(-1)
  }

  const confirmLeaveDemo = async () => {
    if (!leaving) return
    setLeaveBusy(true)
    const moved = await leaveDemo(leaving.postalCode)
    setLeaveBusy(false)
    if (!moved) {
      toast.error(t('demo.leave.failed', lang))
      return
    }
    toast.info(
      t('demo.notice.left_demo', lang).replace('{town}', leaving.town),
      { duration: 12000 }
    )
    setLeaving(null)
    finishLogin()
  }

  if (pilotFull) {
    return (
      <BrandedFrame
        onBack={() => navigate(-1)}
        backAriaLabel={t('common.back', lang)}
      >
        <div className="min-h-full flex flex-col justify-center">
          <PilotFullNotice
            title={t('pilot.full.title', lang)}
            description={t('pilot.full.description', lang)}
            exploreLabel={t('pilot.full.explore', lang)}
            backLabel={t('common.back', lang)}
            onExplore={() => navigate('/home')}
            onBack={() => navigate(-1)}
          />
        </div>
      </BrandedFrame>
    )
  }

  const invited = Boolean(
    searchParams.get('ref') || pendingInvite || currentInviteCode()
  )
  const banner =
    invited || scanPending ? (
      <div className="flex flex-col items-center gap-2">
        {invited && (
          <p className="mx-auto rounded-full bg-km0-teal-100 px-3 py-1 font-ui text-xs font-bold text-km0-teal-700">
            {t('invite.applied', lang)}
          </p>
        )}
        {scanPending && (
          <p className="mx-auto rounded-full bg-km0-teal-100 px-3 py-1 font-ui text-xs font-bold text-km0-teal-700">
            {t('login.scan_pending', lang)}
          </p>
        )}
      </div>
    ) : undefined

  return (
    <BrandedFrame onBack={back} backAriaLabel={t('common.back', lang)}>
      <motion.div
        ref={frameRef}
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={
          step === 'email'
            ? 'flex min-h-0 flex-1 flex-col'
            : 'flex flex-1 flex-col'
        }
      >
        {step === 'choose' ? (
          <AccessDoorChoice
            lang={lang}
            providers={providers}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
            termsHref={LEGAL_ROUTES.terms}
            privacyHref={LEGAL_ROUTES.privacy}
            busyProvider={busyProvider}
            notice={socialNotice}
            onEmail={goToEmail}
            onProvider={handleProvider}
            banner={banner}
            invite={
              <InviteCodeField
                value={inviteCode}
                onChange={setInviteCode}
                initiallyOpen={Boolean(linkInviteCode)}
                toggleLabel={t('login.invite.toggle', lang)}
                label={t('login.invite.label', lang)}
              />
            }
          />
        ) : step === 'email-request' && emailRequestProvider ? (
          <div className="my-auto py-2">
            <EmailRequestStep
              title={t('access.email_request.title', lang)}
              reason={tf('access.email_request.reason', lang, {
                network: networkName(emailRequestProvider, lang),
              })}
              emailLabel={t('account.sheet.email', lang)}
              placeholder={t('login.email_placeholder', lang)}
              backLabel={t('access.email_request.back', lang)}
              email={email}
              error={emailError ? t(EMAIL_ERROR_KEYS[emailError], lang) : null}
              submitting={sending}
              onEmailChange={(value) => {
                setEmail(value)
                setEmailError(null)
              }}
              onSubmit={handleEmailSubmit}
              onBack={back}
            >
              <Button
                type="submit"
                variant="bubblePrimary"
                disabled={sending}
                className="h-12 w-full"
              >
                {t(sending ? 'login.submitting' : 'login.submit', lang)}
              </Button>
            </EmailRequestStep>
          </div>
        ) : (
          <AccessEmailForm
            lang={lang}
            email={email}
            onEmailChange={(value) => {
              setEmail(value)
              if (emailError === 'required' || emailError === 'invalid')
                setEmailError(null)
            }}
            sending={sending}
            error={emailError}
            onSubmit={handleEmailSubmit}
            onChangeMethod={back}
            providers={providers}
            busyProvider={busyProvider}
            socialNotice={socialNotice}
            onProvider={handleProvider}
          />
        )}
      </motion.div>
      <LeaveDemoSheet
        open={leaving !== null}
        town={leaving?.town ?? ''}
        busy={leaveBusy}
        onConfirm={confirmLeaveDemo}
        onStay={() => {
          setLeaving(null)
          finishLogin()
        }}
        lang={lang}
        container={frameRef.current}
      />
    </BrandedFrame>
  )
}

export default Login
