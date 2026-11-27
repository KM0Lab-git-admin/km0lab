import {
  clearPendingReward,
  isFixedOtpEmail,
  isPendingScanFresh,
  leaveDemo,
  otpErrorKey,
  readPendingReward,
  requestOtp,
  scannerPathFor,
  verifyOtp,
  t,
  useAppStore,
  currentInviteCode,
} from '@km0lab/app'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Navigate,
} from 'react-router-dom'
import { toast } from 'sonner'

import type { KeyboardEvent, ClipboardEvent } from 'react'

import BrandedFrame from '@/components/BrandedFrame'
import LeaveDemoSheet from '@/components/LeaveDemoSheet'
import { useLang } from '@/contexts/LangContext'

const RESEND_COOLDOWN_SECONDS = 30
const CODE_LENGTH = 6

interface LocationState {
  email?: string
  mode?: 'signup' | 'login'
  returnTo?: string | null
  referralReference?: string | null
}

/**
 * CheckEmail — Entrada de código OTP de 6 dígitos enviado por email.
 */
const CheckEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = (location.state ?? {}) as LocationState
  const email = state.email ?? searchParams.get('email') ?? undefined
  const { lang } = useLang()

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [leaving, setLeaving] = useState<{
    town: string
    postalCode: string
  } | null>(null)
  const [leaveBusy, setLeaveBusy] = useState(false)
  const [frame, setFrame] = useState<HTMLDivElement | null>(null)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  if (!email) {
    return <Navigate to="/login" replace />
  }

  const verify = async (code: string) => {
    if (verifying) return
    setVerifying(true)
    const { error, notice } = await verifyOtp(
      email,
      code,
      state.referralReference
    )
    if (error) {
      toast.error(t(otpErrorKey(error.kind), lang))
      // Con el código caducado o agotado, lo siguiente es pedir otro: ya.
      if (error.kind === 'expired' || error.kind === 'too_many') setCooldown(0)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputsRef.current[0]?.focus()
      setVerifying(false)
      return
    }
    toast.success(t('otp.welcome', lang))
    // La cuenta no cruza sola entre la demostración y un pueblo real.
    if (notice?.kind === 'account_is_real') {
      toast.info(
        t('demo.notice.account_is_real', lang).replace('{town}', notice.town),
        { duration: 12000 }
      )
    }
    if (notice?.kind === 'confirm_leave_demo') {
      // Se entró desde un pueblo real con una cuenta de demostración: se
      // pregunta, y hasta que conteste no se sigue.
      setLeaving({ town: notice.town, postalCode: notice.postalCode })
      return
    }
    finishLogin()
  }

  /** Lo que sigue a entrar: a la visita pendiente, a donde iba, o a Inicio. */
  const finishLogin = () => {
    // El aviso de puntos de bienvenida solo sale si el servidor acaba de
    // abonarlos (un alta). Entrar con una cuenta que ya existía no lo abre.
    const rewarded = readPendingReward() !== null
    clearPendingReward()
    // Si entró porque abrió el enlace de un comercio, lo primero es sumar
    // esa visita: el escáner valida el código guardado.
    const pendingScan = useAppStore.getState().pendingScan
    const scanPath = isPendingScanFresh(pendingScan, Date.now())
      ? scannerPathFor(pendingScan.code)
      : null
    const safeReturnTo =
      scanPath ??
      (state.returnTo?.startsWith('/') && !state.returnTo.startsWith('//')
        ? state.returnTo
        : rewarded
          ? '/home?welcome=1'
          : '/home')
    navigate(safeReturnTo, { replace: true })
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

  const stayInDemo = () => {
    // El acceso ya dejó la app donde está la cuenta: en la demostración.
    setLeaving(null)
    finishLogin()
  }

  const handleChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = clean
    setDigits(next)
    if (clean && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus()
    }
    if (next.every((d) => d !== '')) {
      verify(next.join(''))
    }
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const lastIdx = Math.min(pasted.length, CODE_LENGTH) - 1
    inputsRef.current[lastIdx]?.focus()
    if (pasted.length === CODE_LENGTH) verify(pasted)
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    const inviteCode = currentInviteCode() ?? undefined
    const postalCode = useAppStore.getState().postalCode ?? undefined
    const { error } = await requestOtp(email, {
      postal_code: postalCode,
      invite_code: inviteCode ?? undefined,
    })
    setResending(false)
    if (error) {
      toast.error(
        t(
          error.kind === 'unknown'
            ? 'otp.toast_resend_fail'
            : otpErrorKey(error.kind),
          lang
        )
      )
      return
    }
    toast.success(t('otp.toast_resent', lang))
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <BrandedFrame
      onBack={() => navigate(-1)}
      backAriaLabel={t('common.back', lang)}
      frameRef={setFrame}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-full flex flex-col items-center justify-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-km0-yellow-500/20 flex items-center justify-center mt-2">
          <Mail className="w-7 h-7 text-km0-blue-700" />
        </div>

        <div className="text-center space-y-1 px-2">
          <h1 className="font-brand text-2xl text-km0-blue-700">
            {t('otp.title', lang)}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {t('otp.subtitle', lang)}
          </p>
          <p className="font-ui text-base text-foreground break-all">{email}</p>
        </div>

        <div className="flex gap-2 mt-1" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={d}
              disabled={verifying}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center font-ui text-xl rounded-xl border-2 border-km0-blue-700/20 bg-background text-foreground focus:outline-none focus:border-km0-blue-700 transition-colors disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="font-body text-sm text-km0-blue-700 underline underline-offset-2 disabled:text-muted-foreground disabled:no-underline mt-1"
        >
          {resending
            ? t('otp.resending', lang)
            : cooldown > 0
              ? `${t('otp.resend_in', lang)} ${cooldown}s`
              : t('otp.resend', lang)}
        </button>

        {isFixedOtpEmail(email) ? (
          <p className="rounded-xl bg-km0-teal-100 px-3 py-2 font-ui text-xs font-bold text-km0-teal-700 text-center mx-4">
            {t('otp.demo_hint', lang)}
          </p>
        ) : null}

        <p className="font-body text-xs text-muted-foreground text-center px-4">
          {t('otp.footer_hint', lang)}
        </p>
      </motion.div>
      <LeaveDemoSheet
        open={leaving !== null}
        town={leaving?.town ?? ''}
        busy={leaveBusy}
        onConfirm={confirmLeaveDemo}
        onStay={stayInDemo}
        lang={lang}
        container={frame}
      />
    </BrandedFrame>
  )
}

export default CheckEmail
